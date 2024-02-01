import { Injectable, InternalServerErrorException, ForbiddenException, HttpStatus, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { generate } from 'generate-password';
import { RegisterUserInput } from './dto/register-user-input.dto';
import { Role, UserRole } from './entities/role.entity';
import { ResendVerificationEmail, UpdateUserInput } from './dto/update-user-input.dto';
import { UsersPayload } from './dto/users-payload.dto';
import UsersInput from './dto/users-input.dto';
import { UpdateRoleInput } from './dto/update-role-input.dto';
import { AccessUserPayload } from './dto/access-user.dto';
import { RedisService } from '../redis/redis.service';
import { VerifyUserAndUpdatePasswordInput } from './dto/verify-user-and-set-password.dto';
import { UserPayload } from './dto/register-user-payload.dto';
import { SearchUserInput } from './dto/search-user.input';
import { UpdatePasswordInput } from './dto/update-password-input';
import { createPasswordHash, createToken } from '../lib/helper';
import { AwsSimpleEmailService } from 'src/aws/aws-ses.service';
import { TemplateSwitch } from 'src/aws/dto/dynamicTemplateData.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RolesData, UsersData } from './seeds/seed-data';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    @InjectModel(Role.name)
    private readonly rolesModel: Model<Role>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly awsSimpleEmailService: AwsSimpleEmailService
  ) { }

  /**
 * Get user
 * @returns user 
 */
  async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.usersModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Creates users service
   * @param registerUserInput
   * @returns created user
   */
  async create(registerUserInput: RegisterUserInput): Promise<User> {
    try {
      const { roleType } = registerUserInput
      const email = registerUserInput.email.trim().toLowerCase();

      const existingUser = await this.findOne(email, true);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      registerUserInput.password = await createPasswordHash(registerUserInput.password || generate({ length: 10, numbers: true }));

      const role = await this.rolesModel.findOne({ role: roleType });

      if (!role) {
        throw new BadRequestException(`Role Does'nt exist`)
      }

      const { _id: roleId } = role
      // User Creation
      const user = await this.usersModel.create({
        ...registerUserInput,
        email,
        roleIds: [roleId]
      });

      // user is manager or admin then send this mail
      if (roleType === UserRole.ADMIN) {
        await this.sendVerificationEmail(user, "setPassword");
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Updates users service
   * @param updateUserInput
   * @returns update user
   */
  async update(updateUserInput: UpdateUserInput): Promise<User> {
    try {
      const { email, id } = updateUserInput
      const user = await this.findById(id);

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      if (email && email !== user.email) {
        // send email verification link
        updateUserInput.emailVerified = false;
      };

      return await this.usersModel.findByIdAndUpdate(id, updateUserInput, { new: true });

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateRole(updateRoleInput: UpdateRoleInput): Promise<User> {
    try {
      const { roles, id } = updateRoleInput;
      const user = await this.findById(id, UserStatus.ACTIVE);

      if (user) {
        const fetchedRoles = await this.rolesModel.find({ role: { $in: roles } }).exec();
        const roleIds = fetchedRoles.map(v => v._id);
        return await this.usersModel.findByIdAndUpdate(id, { roleIds }, { new: true })
      }

      throw new NotFoundException('User not found');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Finds all
   * @param usersInput
   * @returns paginated users results
   */
  async findAll(usersInput: UsersInput): Promise<UsersPayload> {
    try {
      const { limit, page, from, roles, status, to, searchQuery } = usersInput;

      const startDate = from ? new Date(from).toISOString() : new Date().toISOString();
      const endDate = to ? new Date(to).toISOString() : new Date().toISOString();
      const regex = new RegExp(searchQuery, 'i');

      const users = await this.usersModel.find({
        ...(searchQuery ? {
          $or: [
            { firstName: { $regex: regex } },
            { lastName: { $regex: regex } },
            { email: { $regex: regex } },
          ]
        } : {}),

        ...(status != null ? { status } : {}),
        ...(roles ? {
          roleIds: {
            $in: roles
          }
        } : {}),

        // date range filter
        ...(from ? {
          createdAt: { $gte: startDate, $lte: endDate }
        } : {}),
      })
        .populate('roles')
        .sort({ createdAt: "desc" })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalCount = await this.usersModel.countDocuments();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        users,
        response: { status: 200, message: 'OK' },

        pagination: {
          totalCount,
          page,
          limit,
          totalPages
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 
   * @param searchUserInput 
   * @returns User[]
   */
  async search(searchUserInput: SearchUserInput): Promise<User[]> {
    const { searchTerm } = searchUserInput;
    const [firstName, lastName] = searchTerm.trim().split(' ');
    const firstNameRegex = new RegExp(firstName, 'i');
    const lastNameRegex = new RegExp(lastName, 'i');

    return await this.usersModel.find({
      $or: [
        { firstName: { $regex: firstNameRegex } },
        { lastName: { $regex: lastName ? lastNameRegex : firstNameRegex } },
        { email: { $regex: searchTerm } },
      ]
    })
      .sort({ createdAt: "desc" });

  }

  /**
   * Finds User by Email
   * @param email
   * @returns one user
   */
  async findOne(email: string, all = false): Promise<User> {
    const condition = { email, status: UserStatus.ACTIVE };
    all && delete condition.status;
    return await this.usersModel.findOne(condition).populate('roles').exec();
  }

  /**
   * Finds User by id
   * @param id
   * @returns by id
   */
  async findById(_id: string, status?: UserStatus): Promise<User> {
    const condition = { _id, status };
    !status && delete condition.status;
    return await this.usersModel.findOne(condition).populate('roles').exec();
  }


  /**
   * Finds all users - Non Paginated
   * @param ids 
   * @returns all users 
   */
  async findAllUsers(ids: string[]): Promise<User[]> {
    return this.usersModel.find({ _id: { $in: ids } }).populate('roles').exec();
  }

  /**
   * Removes users
   * @param id
   * @returns remove
   */
  async remove(id: string): Promise<UserPayload> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const { _id } = user
    await this.usersModel.findByIdAndRemove(_id);

    return {
      user: null,
      response: { status: HttpStatus.OK, message: 'User deleted successfully' },
    };
  }

  /**
   * Deactivates user
   * @param id
   * @returns user
   */
  async deactivateUser(id: string): Promise<User> {
    try {
      const user = await this.findById(id, UserStatus.ACTIVE);
      if (user) {
        if (
          [UserRole.ADMIN, UserRole.SUPER_ADMIN].every((i) =>
            user.roles.map((role) => role.role).includes(i),
          )
        ) {
          throw new ForbiddenException("Super Admin can't be deactivated");
        }

        user.status = UserStatus.DEACTIVATED;
        const { _id } = user
        return await this.usersModel.findByIdAndUpdate(_id, user, { new: true });
      }

      throw new ForbiddenException('User already Deactivated');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Activates user
   * @param id
   * @returns user
   */
  async activateUser(id: string): Promise<User> {
    try {
      const user = await this.usersModel.findById(id);
      if (user) {
        const { _id } = user;
        user.status = UserStatus.ACTIVE;
        return await this.usersModel.findByIdAndUpdate(_id, user, { new: true });
      }

      throw new NotFoundException("User Not Found");
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Creates token
   * @param user
   * @param paramPass
   * @returns token
   */
  async createToken(user: User, paramPass: string): Promise<AccessUserPayload> {
    const passwordMatch = await bcrypt.compare(paramPass, user.password);

    if (!passwordMatch) {
      throw new BadRequestException('Incorrect Email or Password')
    };

    return {
      access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
      roles: user.roles,
      response: {
        message: 'OK',
        status: 200,
        name: 'Token Created',
      },
    }
  }
  /**
   * Validates user
   * @param email
   * @param pass
   * @returns user
   */
  async validateUser(email: string, pass: string): Promise<any> {
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
   * Logins users service
   * @param user
   * @returns access token object
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * 
   * @param user 
   */
  async sendVerificationEmail(user: User, templateName: TemplateSwitch = 'verifyEmail') {
    const { fullName, id, email, roles } = user;
    const userRoles = roles.map(item => item.role)
    const token = createToken()
    await this.update({ id, token })
    await this.redisService.set(`VERIFY-${token}`, id, 60 * 60 * 72);
    await this.awsSimpleEmailService.sendEmail(email, fullName, token, templateName);
  }

  /**
   * Verifies users service
   * @param token
   * @returns  jwt object with roles
   */
  async verify(token: string) {
    const secret = await this.jwtService.verify(token);
    const user = await this.findRolesByUserId(secret.sub);

    return {
      ...secret,
      roles: user.roles.map((role) => role.role),
    };
  }

  /**
   * Verifies users Email and Set Password service
   * @param token
   * @returns  jwt object with roles
   */
  async verifyEmailAndSetPassword(
    verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput,
  ) {
    const { token, password } = verifyEmailAndSetPasswordInput;
    let user = await this.verifyEmail(token);
    if (user) {
      user = await this.updatePassword(user.id, password);
      return user;
    }
  }
  /**
   * Finds roles by user id
   * @param id
   * @returns roles by user id
   */
  async findRolesByUserId(_id: string): Promise<User> {
    return this.usersModel.findOne({
      _id,
      status: UserStatus.ACTIVE,
    })
      .populate('roles')
      .exec();
  }

  /**
   * Forgot password
   * @param email
   * @returns password
   */
  async forgotPassword(email: string): Promise<User> {
    try {
      const user = await this.findOne(email, true);
      if (user) {
        const { id, email, fullName } = user
        const token = createToken()
        await this.redisService.set(`FORGOT-${token}`, id, 60 * 60 * 24);
        await this.awsSimpleEmailService.sendEmail(email, fullName, token, "forgetPassword");
        return user;
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Verifies email
   * @param token
   * @returns email
   */
  async verifyEmail(token: string): Promise<User> {
    try {
      // Find Token in Redis
      const findToken = await this.redisService.get(`VERIFY-${token}`);
      if (findToken) {
        const user = await this.findById(findToken, UserStatus.DEACTIVATED);
        if (user) {
          const { _id } = user
          user.emailVerified = true;
          user.status = UserStatus.ACTIVE;
          await this.usersModel.findByIdAndUpdate(_id, user, { new: true })
          // Delete token from Redis
          this.redisService.delete(`VERIFY-${token}`);
          return user;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * @param id
   * @param password
   * @returns user with updatedPassword
   */
  async updatePassword(id: string, password: string) {
    const user = await this.findById(id);
    if (user) {
      const { status, emailVerified } = user
      user.password = await createPasswordHash(password);

      if (status === UserStatus.DEACTIVATED || !emailVerified) {
        user.emailVerified = true;
        user.status = UserStatus.ACTIVE
      }

      const { _id } = user
      return await this.usersModel.findByIdAndUpdate(_id, user, { new: true })
    }
  }

  /**
   * @param id
   * @param password
   * @returns user with updatedPassword
   */
  async setNewPassword(
    updatePasswordInput: UpdatePasswordInput,
  ): Promise<User | undefined> {
    const { id, newPassword } = updatePasswordInput

    try {
      const user = await this.findById(id);
      if (user) {
        const { _id } = user
        user.password = await createPasswordHash(newPassword);
        return await this.usersModel.findByIdAndUpdate(_id, user, { new: true })
      }

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
  async resetPassword(
    password: string,
    token: string,
  ): Promise<User | undefined> {
    try {
      const findToken = await this.redisService.get(`FORGOT-${token}`);

      if (findToken) {
        const updatedUser = await this.updatePassword(findToken, password);
        this.redisService.delete(`FORGOT-${token}`);
        return updatedUser;
      }
      return undefined;
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
    resendVerificationEmail: ResendVerificationEmail,
  ): Promise<User> {
    try {
      const user = await this.findOne(resendVerificationEmail.email.trim().toLowerCase(), true);

      if (!user) {
        throw new ForbiddenException("User doesn't exist");
      }

      await this.sendVerificationEmail(user);

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Finds all roles
   * @returns all roles
   */
  async findAllRoles(): Promise<Role[]> {
    try {
      return await this.rolesModel.find({
        role: {
          $ne: UserRole.SUPER_ADMIN
        }
      });
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
      const users = await this.usersModel.find({
        $or: [
          { roles: UserRole.ADMIN },
          { roles: UserRole.SUPER_ADMIN }
        ]
      })

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
      throw new NotFoundException('User Not Found');
    }

    return { user, response: { status: 200, message: 'User Data' } }
  }

  /**
   * User Seeder
   */
  async seedUsers(): Promise<void> {
    try {
      const allRoles = await this.rolesModel.find();
      const users = await this.usersModel.find();

      if (!users.length && allRoles.length) {
        await Promise.all(
          UsersData.map(async (user) => {
            const { email, password } = user
            const isExistingUser = await this.usersModel.findOne({ email })
            if (!isExistingUser) {
              user.password = await createPasswordHash(password)
              const role = allRoles.find(object => (object.role === user.roleType))
              if (role) {
                await this.usersModel.create({ ...user, roleIds: [role._id] });
              }
            }

          })
        )
      }

      console.log(">>>>>>>>>>>>>>>>USERS CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  /**
   * Role Seeder
   */
  async seedRoles(): Promise<void> {
    try {
      const roles = await this.rolesModel.find();
      const dbRoles = roles.map(role => role.role)

      await Promise.all(
        RolesData.map(async ({ role }) => {
          if (!dbRoles.includes(role)) {
            await this.rolesModel.create({ role });
          }
        })
      )

      console.log(">>>>>>>>>>>>>>>>USER ROLES CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}


