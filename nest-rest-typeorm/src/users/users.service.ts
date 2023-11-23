import { Injectable, InternalServerErrorException, ForbiddenException, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserStatus } from './entities/user.entity';
import { Repository, Not, In, QueryRunner, Brackets } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
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
      return await this.usersRepository.findOne({ where: { email } });
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
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          error: 'User already exists',
        });
      }

      registerUserInput.password = registerUserInput.password || generate({ length: 10, numbers: true });
      // User Creation
      const userInstance = this.usersRepository.create({
        ...registerUserInput,
        email,
      });

      const role = await this.rolesRepository.findOne({
        where: { role: roleType },
      });

      userInstance.roles = [role];
      const user = await this.usersRepository.save(userInstance);
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
   * 
   * @param registerUserInput 
   * @param queryRunner 
   * @returns User
   */
  async createPanelist(registerUserInput: RegisterUserInput, queryRunner: QueryRunner, notFromCsv?: boolean): Promise<User> {
    try {
      const { roleType } = registerUserInput
      const email = registerUserInput.email.trim().toLowerCase();

      const existingUser = await this.findOne(email, true);

      if (existingUser && notFromCsv) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          error: 'User with this email already exists',
        });
      }

      if (existingUser && !notFromCsv) {
        return null
      }

      registerUserInput.password = registerUserInput.password || generate({ length: 10, numbers: true });
      // User Creation
      const userInstance = this.usersRepository.create({
        ...registerUserInput,
        email,
      });

      const role = await this.rolesRepository.findOne({
        where: { role: roleType },
      });

      userInstance.roles = [role];
      const user = await queryRunner.manager.save(userInstance);

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
      const user = await this.findById(updateUserInput.id);
      return await this.usersRepository.save({ ...user, ...updateUserInput });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateRole(updateRoleInput: UpdateRoleInput): Promise<User> {
    try {
      const { roles } = updateRoleInput;
      const user = await this.findById(updateRoleInput.id, UserStatus.ACTIVE);

      if (user) {
        const fetchedRoles = await this.rolesRepository
          .createQueryBuilder('role')
          .where('role.role IN (:...roles)', { roles })
          .getMany();

        user.roles = fetchedRoles;
        return await this.usersRepository.save(user);
      }

      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'User not found',
      });
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

      const query = this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')

      if (from || roles?.length || status != null || searchQuery) {
        query.andWhere(new Brackets(qb => {
          if (from) {
            const startDate = new Date(from).toISOString();
            const endDate = to ? new Date(to).toISOString() : new Date().toISOString();
            qb.andWhere('user.createdAt >= :startDate AND user.createdAt <= :endDate', { startDate, endDate });
          }

          if (roles?.length) {
            qb.andWhere('role.role IN (:...roles)', { roles })
          }

          if (status != null) {
            qb.andWhere('user.status = :status', { status });
          }

          if (searchQuery) {
            qb.andWhere(new Brackets((qb1) => {
              qb1.where('user.email ILIKE :searchEmail', { searchEmail: `%${searchQuery || ""}%` })
                .orWhere('user.firstName ILIKE :searchFirstName', { searchFirstName: `%${searchQuery || ""}%` })
                .orWhere('user.lastName ILIKE :searchLastName', { searchLastName: `%${searchQuery || ""}%` });
            }));
          }
        }));
      }

      const [users, totalCount] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getManyAndCount()

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

    const searchQuery = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.firstName ILIKE :first', { first: `%${firstName || ""}%` })
      .orWhere('user.lastName ILIKE :last', { last: `%${lastName ? lastName : firstName || ""}%` })
      .orWhere('user.email ILIKE :searchTerm', { searchTerm: `%${firstName || ""}%` })
      .orderBy('user.createdAt', 'DESC')

    if (lastName) searchQuery.orWhere('user.email ILIKE :searchTermLastName', { searchTermLastName: `%${lastName || ""}%` })

    const result = await searchQuery.getMany();
    return result;
  }

  /**
   * Finds User by Email
   * @param email
   * @returns one user
   */
  async findOne(email: string, all = false): Promise<User> {
    const condition = { email, status: UserStatus.ACTIVE };
    all && delete condition.status;
    return await this.usersRepository.findOne({ where: condition });
  }

  /**
   * Finds User by id
   * @param id
   * @returns by id
   */
  async findById(id: string, status?: UserStatus): Promise<User> {
    const condition = { id, status };
    !status && delete condition.status;
    return await this.usersRepository.findOne({ where: condition });
  }


  /**
   * Finds all users - Non Paginated
   * @param ids 
   * @returns all users 
   */
  async findAllUsers(ids: string[]): Promise<User[]> {
    return this.usersRepository.find({ where: { id: In([...ids]), status: UserStatus.ACTIVE } })
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
        error: 'user not found',
      });
    }
    await this.usersRepository.delete(user.id);
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
          throw new ForbiddenException({
            status: HttpStatus.FORBIDDEN,
            error: "Super Admin can't be deactivated",
          });
        }
        user.status = UserStatus.DEACTIVATED;
        return await this.usersRepository.save(user);
      }

      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        error: 'User already Deactivated',
      });
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
      const user = await this.usersRepository.findOne({ where: { id } });
      user.status = UserStatus.ACTIVE;
      return await this.usersRepository.save(user);
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
    if (passwordMatch) {
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
        response: {
          message: 'OK',
          status: 200,
          name: 'Token Created',
        },
      };
    } else {
      return {
        response: {
          message: 'Incorrect Email or Password',
          status: 404,
          name: 'Email or Password invalid',
        },
        access_token: null,
        roles: [],
      };
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
  async findRolesByUserId(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id,
        status: UserStatus.ACTIVE,
      },
      relations: ['roles'],
      select: ['id'],
    });
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
        const { id, email, fullName, roles } = user
        const userRoles = roles.map(item => item.role)
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
        user.emailVerified = true;
        user.status = UserStatus.ACTIVE;
        user.token = null
        await this.usersRepository.save(user);
        // Delete token from Redis
        this.redisService.delete(`VERIFY-${token}`);
        return user;
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

      const updatedUser = await this.usersRepository.save(user);
      return updatedUser;
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
      user.password = await createPasswordHash(newPassword);
      return await this.usersRepository.save(user);
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
        throw new ForbiddenException({
          status: HttpStatus.FORBIDDEN,
          error: "User doesn't exist",
        });
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
      return await this.rolesRepository.find({
        where: {
          role: Not(UserRole.SUPER_ADMIN),
        },
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
      const users = await this.usersRepository
        .createQueryBuilder('users')
        .innerJoinAndSelect('users.roles', 'role')
        .where('role.role = :roleType1', { roleType1: UserRole.ADMIN })
        .orWhere('role.role = :roleType2', { roleType2: UserRole.SUPER_ADMIN })
        .getMany();
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
        error: 'user not found',
      });
    }

    return { user, response: { status: 200, message: 'User Data' } }
  }

  /**
   * 
   * @param users 
   * @returns User[]
   */
  async bulkUpdateUserTemp(users: User[]): Promise<User[]> {
    try {
      return await this.usersRepository.save(users);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

  }
}


