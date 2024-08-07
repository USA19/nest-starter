import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import TwilioService from "../twilio/twilio.service";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";
import {
  Role,
  User,
  UserOnRole,
  UserRole,
  UserStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterUserInput } from "./dto/register-user-input.dto";
import { generate } from "generate-password";
import { UserDto, UserOnRoleDto } from "./dto/user.dto";
import {
  ResendVerificationEmail,
  UpdateUserInput,
} from "./dto/update-user-input.dto";
import { UserPayload } from "./dto/register-user-payload.dto";
import { UpdateRoleInput } from "./dto/update-role-input.dto";
import UsersInput from "./dto/users-input.dto";
import { UsersPayload } from "./dto/users-payload.dto";
import { CurrentUserInterface } from "./auth/dto/current-user.dto";
import { LoginUserInput } from "./dto/login-user-input.dto";
import { AccessUserPayload } from "./dto/access-user.dto";
import { TemplateSwitch } from "../aws/dto/dynamicTemplateData.dto";
import { createPasswordHash, createToken } from "../lib/helper";
import { AwsSimpleEmailService } from "../aws/aws-ses.service";
import { VerifyUserAndUpdatePasswordInput } from "./dto/verify-user-and-set-password.dto";
import { UpdatePasswordInput } from "./dto/update-password-input";
import RolesPayload from "./dto/roles-payload.dto";
import { ForgotPasswordInput } from "./dto/forget-password-input.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
    private readonly prisma: PrismaService,
    private readonly awsSimpleEmailService: AwsSimpleEmailService
  ) { }

  /**
   * Finds User by id
   * @param id
   * @returns by id
   */
  async findById(id: string, status?: UserStatus): Promise<UserDto> {
    const where = { id, status };
    !status && delete where.status;
    return await this.prisma.user.findUnique({
      where,
      include: { userRole: { include: { role: true } } },
    });
  }

  /**
   *
   * @param role
   * @returns Role
   */
  async findOneRole(role: UserRole): Promise<Role> {
    return await this.prisma.role.findFirst({ where: { role } });
  }

  /**
   * Finds User by Email
   * @param email
   * @returns one user
   */
  async findOne(email: string, all = false): Promise<UserDto> {
    const where = { email, status: UserStatus.ACTIVE };
    all && delete where.status;
    return await this.prisma.user.findUnique({
      where,
      include: { userRole: { include: { role: true } } },
    });
  }

  /**
   * Finds all users - Non Paginated
   * @param ids
   * @returns all users
   */
  async findAllUsers(ids: string[]): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE, id: { in: [...ids] } },
    });
  }

  /**
   * Finds roles by user id
   * @param id
   * @returns roles by user id
   */
  async findRolesByUserId(userId: string): Promise<UserOnRoleDto[]> {
    return await this.prisma.userOnRole.findMany({
      where: {
        userId,
        user: {
          status: UserStatus.ACTIVE,
        },
      },
      include: { role: true },
    });
  }

  /**
   * Creates users service
   * @param registerUserInput
   * @returns created user
   */
  async create(registerUserInput: RegisterUserInput): Promise<UserDto> {
    try {
      const { roleType, phoneNumber } = registerUserInput;
      const email = registerUserInput.email.trim().toLowerCase();

      const existingUser = await this.findOne(email, true);
      if (existingUser) {
        throw new ConflictException("User already exists");
      }

      registerUserInput.password =
        registerUserInput.password || generate({ length: 10, numbers: true });

      const role = await this.findOneRole(roleType);

      if (!role) {
        throw new BadRequestException(`Role Does'nt exist`);
      }

      // if (phoneNumber) {
      //   await this.twilioService.sendVerificationCode(phoneNumber);
      // }

      delete registerUserInput.roleType;

      const user = await this.prisma.user.create({
        data: {
          ...registerUserInput,
          email,
          userRole: {
            create: {
              roleId: role.id,
            },
          },
        },

        include: {
          userRole: {
            include: {
              role: true,
            },
          },
        },
      });

      // user is manager or admin then send this mail
      // if (roleType === UserRole.ADMIN) {
      //   await this.sendVerificationEmail(user, "setPassword");
      // }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param loginUserInput
   * @returns AccessUserPayload
   */
  async login(loginUserInput: LoginUserInput): Promise<AccessUserPayload> {
    try {
      const { email, password } = loginUserInput;
      const user = await this.findOne(email, true);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const { emailVerified } = user

      if (!emailVerified) {
        throw new ForbiddenException(
          "Email changed or not verified, please verify your email"
        );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new BadRequestException("Incorrect Email or Password");
      }

      return this.createToken(user);

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param registerUserInput
   * @returns Promise<AccessUserPayload>
   */
  async socialAuth(
    registerUserInput: RegisterUserInput
  ): Promise<AccessUserPayload> {
    try {
      const { email } = registerUserInput;
      const user =
        (await this.findOne(email, true)) ??
        (await this.create({
          ...registerUserInput,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        }));

      return await this.createToken(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates users service
   * @param updateUserInput
   * @returns update user
   */
  async update(updateUserInput: UpdateUserInput, id: string): Promise<UserPayload> {
    try {
      const user = await this.findById(id);

      if (!user) {
        throw new NotFoundException("User Not Found.");
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id,
        },

        data: {
          ...updateUserInput,
        },
      });

      return {
        user: updatedUser,
        response: { status: 200, message: "User updated successfully" },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param updateRoleInput
   * @returns UserPayload
   */
  async updateRole(updateRoleInput: UpdateRoleInput, id: string): Promise<UserPayload> {
    try {
      const { roles } = updateRoleInput;
      const user = await this.findById(id, UserStatus.ACTIVE);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      await this.prisma.userOnRole.deleteMany({
        where: { userId: id },
      });

      const { roles: allRoles } = await this.findAllRoles();

      const data = roles.map((roleItem) => {
        const { id: roleId } = allRoles.find((item) => item.role === roleItem);
        return {
          roleId,
          userId: id,
        };
      });

      await this.prisma.userOnRole.createMany({
        data,
      });

      return {
        user,
        response: { status: 200, message: "User Data updated successfully" },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param usersInput
   * @returns UsersPayload
   */
  async findAll(usersInput: UsersInput): Promise<UsersPayload> {
    try {
      const { limit, page, from, to, roles, status, searchQuery } = usersInput;

      const where: Prisma.UserWhereInput = {};
      if (from || to || roles?.length || status != null || searchQuery) {
        where.createdAt = {};

        if (from) {
          where.createdAt.gte = new Date(from).toISOString();
        }

        if (to) {
          where.createdAt.lte = new Date(to).toISOString();
        }

        if (roles?.length) {
          where.userRole = { some: { role: { role: { in: roles } } } };
        }

        if (status != null) {
          where.status = status;
        }

        if (searchQuery) {
          where.OR = [
            { email: { contains: searchQuery, mode: "insensitive" } },
            { firstName: { contains: searchQuery, mode: "insensitive" } },
            { lastName: { contains: searchQuery, mode: "insensitive" } },
          ];
        }
      }

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { userRole: { include: { role: true } } },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        users,
        response: { status: 200, message: "OK" },
        pagination: {
          totalCount,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Removes users
   * @param id
   * @returns remove
   */
  async remove(id: string): Promise<UserPayload> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: "user not found",
      });
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      user: null,
      response: { status: HttpStatus.OK, message: "User deleted successfully" },
    };
  }

  /**
   * Deactivates user
   * @param id
   * @returns user
   */
  async deactivateUser(id: string): Promise<UserPayload> {
    try {
      const user = await this.findById(id, UserStatus.ACTIVE);

      if (!user) {
        throw new ForbiddenException({
          status: HttpStatus.FORBIDDEN,
          error: "User already Deactivated",
        });
      }

      const { userRole } = user;
      const userRoles = userRole.map((userRoleItem) => {
        const { role: { role } = {} } = userRoleItem;
        return role;
      });

      if (
        [UserRole.ADMIN, UserRole.SUPER_ADMIN].every((i) =>
          userRoles.includes(i)
        )
      ) {
        throw new ForbiddenException({
          status: HttpStatus.FORBIDDEN,
          error: "Super Admin can't be deactivated",
        });
      }

      return await this.update({ status: UserStatus.DEACTIVATED }, id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Activates user
   * @param id
   * @returns user
   */
  async activateUser(id: string): Promise<UserPayload> {
    try {
      const user = await this.findById(id, UserStatus.ACTIVE);

      if (!user) {
        throw new ForbiddenException({
          status: HttpStatus.FORBIDDEN,
          error: "User already Deactivated",
        });
      }

      return await this.update({ status: UserStatus.ACTIVE }, id,);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Verifies users service
   * @param token
   * @returns  jwt object with roles (CurrentUserInterface)
   */
  async verify(token: string): Promise<CurrentUserInterface> {
    const secret = await this.jwtService.verify(token);
    const user = await this.findById(secret.sub);
    const { userRole } = user;
    const roles = userRole.map((userRoleItem) => {
      const { role } = userRoleItem || {};
      const { role: roleItem } = role;

      return roleItem;
    });

    return {
      ...secret,
      roles,
    };
  }

  /**
   *
   * @param token
   * @returns UserDto
   */
  async verifyRefreshToken(token: string): Promise<UserDto> {
    const secret = this.jwtService.verify(token, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
    });

    return await this.findById(secret.sub);
  }

  /**
   * Logins users service
   * @param user
   * @returns access token object
   */
  generateAccessToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Creates token
   * @param user
   * @param paramPass
   * @returns token
   */
  async createToken(user: UserDto): Promise<AccessUserPayload> {
    const { id: sub, email, userRole } = user;
    const payload = { email, sub };
    const roles = userRole.map((userRoleItem) => {
      const { role } = userRoleItem || {};
      return role;
    });

    return {
      ...this.generateAccessToken(user),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRY"),
      }),

      roles,
      response: {
        message: "OK",
        status: 200,
        name: "Token Created",
      },
    };
  }

  /**
   *
   * @param refreshToken
   * @returns : Promise<AccessUserPayload>
   */
  async refreshToken(refreshToken: string): Promise<AccessUserPayload> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });

      const { sub } = payload || {};
      const user = await this.findById(sub);

      if (!user) {
        throw new UnauthorizedException("User Not Found.");
      }

      const { userRole } = user;

      const roles = userRole.map((userRoleItem) => {
        const { role } = userRoleItem || {};
        return role;
      });

      const { access_token } = this.generateAccessToken(user);
      return { access_token, roles };
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Validates user
   * @param email
   * @param pass
   * @returns user
   */
  async validateUser(email: string, pass: string) {
    const user = await this.findOne(email);
    if (user) {
      const passwordMatch = await bcrypt.compare(pass, user.password);
      if (passwordMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    return null;
  }

  /**
   *
   * @param user
   */
  async sendVerificationEmail(
    user: UserDto,
    templateName: TemplateSwitch = "verifyEmail"
  ) {
    const { firstName, lastName, id, email, userRole } = user;
    const fullName = `${firstName} ${lastName}`;
    const userRoles = userRole.map((userRoleItem) => {
      const { role: { role } = {} } = userRoleItem;
      return role;
    });

    const token = createToken();
    await this.update({ token }, id,);
    await this.redisService.set(`VERIFY-${token}`, id, 60 * 60 * 72);
    await this.awsSimpleEmailService.sendEmail(
      email,
      fullName,
      token,
      templateName
    );
  }

  /**
   * Verifies email
   * @param token
   * @returns email
   */
  async verifyEmail(token: string): Promise<UserPayload> {
    try {
      // Find Token in Redis
      const findToken = await this.redisService.get(`VERIFY-${token}`);
      if (!findToken) {
        throw new NotFoundException("Verification Token not Found");
      }

      const user = await this.findById(findToken, UserStatus.DEACTIVATED);

      const { id } = user;

      await this.update({
        status: UserStatus.ACTIVE,
        emailVerified: true,
      }, id);

      this.redisService.delete(`VERIFY-${token}`);

      return {
        user: null,
        response: {
          status: 200,
          message: "Email verified successfully",
          name: "Email Verified Successfully",
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * @param id
   * @param password
   * @returns user with updatedPassword
   */
  async updatePassword(id: string, password: string): Promise<UserPayload> {
    const user = await this.findById(id);
    if (user) {
      const { status, emailVerified } = user;
      user.password = await createPasswordHash(password);

      if (status === UserStatus.DEACTIVATED || !emailVerified) {
        user.emailVerified = true;
        user.status = UserStatus.ACTIVE;
      }

      const updatedUser = await this.update({
        status: user.status,
        emailVerified: user.emailVerified,
      }, id);

      return updatedUser;
    }
  }

  /**
   * Verifies users Email and Set Password service
   * @param token
   * @returns  jwt object with roles
   */
  async verifyEmailAndSetPassword(
    verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput
  ) {
    const { token, password } = verifyEmailAndSetPasswordInput;
    const { user } = await this.verifyEmail(token);

    if (!user) {
      throw new NotFoundException("Token not found");
    }

    const { id } = user;
    return await this.updatePassword(id, password);
  }

  /**
   * Forgot password
   * @param email
   * @returns password
   */
  async forgotPassword(
    forgotPasswordInput: ForgotPasswordInput
  ): Promise<UserPayload> {
    const { email } = forgotPasswordInput;
    const user = await this.findOne(email, true);
    try {
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const { firstName, lastName, id, email, userRole } = user;
      const fullName = `${firstName} ${lastName}`;
      const userRoles = userRole.map((userRoleItem) => {
        const { role: { role } = {} } = userRoleItem;
        return role;
      });

      const token = createToken();

      await Promise.all([
        this.redisService.set(`FORGOT-${token}`, id, 60 * 60 * 24),
        this.awsSimpleEmailService.sendEmail(
          email,
          fullName,
          token,
          "forgetPassword"
        ),
      ]);

      return {
        user: null,
        response: {
          status: 200,
          message: "Forgot Password Email Sent to User",
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * @param id
   * @param password
   * @returns user with updatedPassword
   */
  async setNewPassword(
    updatePasswordInput: UpdatePasswordInput,
    id: string
  ): Promise<UserPayload> {
    const { newPassword } = updatePasswordInput;

    try {
      const user = await this.findById(id);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const password = await createPasswordHash(newPassword);
      await this.update({ password }, id);

      return {
        user,
        response: {
          status: 200,
          message: "Password updated successfully",
          name: "updatePassword",
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Resets password
   * @param password
   * @param token
   * @returns user
   */
  async resetPassword(password: string, token: string): Promise<UserPayload> {
    try {
      const findToken = await this.redisService.get(`FORGOT-${token}`);
      if (!findToken) {
        throw new NotFoundException("Token not found");
      }

      const updatedUser = await this.updatePassword(findToken, password);
      this.redisService.delete(`FORGOT-${token}`);
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Resend verification email
   * @param resendVerificationEmail
   * @returns verification email
   */
  async resendVerificationEmail(
    resendVerificationEmail: ResendVerificationEmail
  ): Promise<UserPayload> {
    try {
      const user = await this.findOne(
        resendVerificationEmail.email.trim().toLowerCase(),
        true
      );

      if (!user) {
        throw new ForbiddenException("User doesn't exist");
      }

      await this.sendVerificationEmail(user);

      return {
        user: null,

        response: {
          status: 200,
          message:
            "An email has been sent to you, check your email for verification",
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Finds all roles
   * @returns all roles
   */
  async findAllRoles(): Promise<RolesPayload> {
    try {
      const roles = await this.prisma.role.findMany({
        where: {
          role: {
            not: UserRole.SUPER_ADMIN,
          },
        },
      });

      return {
        roles,
        response: {
          message: "OK",
          status: 200,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Gets admins
   * @returns admins
   */
  async getAdmins(): Promise<Array<string>> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          userRole: {
            some: {
              role: {
                role: {
                  in: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
                },
              },
            },
          },
        },
      });

      return users.map((u) => u.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param id
   * @returns : Promise<UserPayload>
   */
  async findUserById(id: string): Promise<UserPayload> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: "user not found",
      });
    }

    return { user, response: { status: 200, message: "User Data" } };
  }
}
