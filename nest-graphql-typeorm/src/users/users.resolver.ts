import { HttpStatus, NotFoundException, UseFilters, UseGuards, SetMetadata, ForbiddenException, UsePipes, ValidationPipe, } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { LoginUserInput } from './dto/login-user-input.dto';
import { CurrentUser } from '../customDecorators/current-user.decorator';
import { UsersPayload } from './dto/users-payload.dto';
import { AccessUserPayload } from './dto/access-user.dto';
import { RegisterUserInput } from './dto/register-user-input.dto';
import { UserPayload } from './dto/register-user-payload.dto';
import { ForgotPasswordInput } from './dto/forget-password-input.dto';
import { ResetPasswordInput } from './dto/reset-password-input.dto';
import { ForgotPasswordPayload } from './dto/forgot-password-payload.dto';
import RolesPayload from './dto/roles-payload.dto';
import { UserIdInput } from './dto/user-id-input.dto';
import { GetUser, ResendVerificationEmail, UpdateUserInput } from './dto/update-user-input.dto';
import UsersInput from './dto/users-input.dto';
import { UpdateRoleInput } from './dto/update-role-input.dto';
import { VerifyEmailInput } from './dto/verify-email-input.dto';
import { CurrentUserInterface } from './auth/dto/current-user.dto';
import { HttpExceptionFilter } from '../exception-filter';
import { JwtAuthGraphQLGuard } from './auth/jwt-auth-graphql.guard';
import RoleGuard from './auth/role.guard';
import { VerifyUserAndUpdatePasswordInput } from './dto/verify-user-and-set-password.dto';
import { SearchUserInput } from './dto/search-user.input';
import { UpdatePasswordInput } from './dto/update-password-input';

@Resolver('users')
@UseFilters(HttpExceptionFilter)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  // Queries
  @Query(() => UsersPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async fetchAllUsers(@Args('userInput') usersInput: UsersInput): Promise<UsersPayload> {
    return await this.usersService.findAll(usersInput);
  }

  @Query(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard)
  async fetchUser(@CurrentUser() user: CurrentUserInterface): Promise<UserPayload> {
    const { email } = user;
    return { user: await this.usersService.findOne(email), response: { status: 200, message: 'User Data' } };
  }

  @Query(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard)
  async me(@CurrentUser() currentUser: CurrentUserInterface): Promise<UserPayload> {
    const { email } = currentUser
    const user = await this.usersService.findOne(email);
    if (user?.emailVerified) {
      return {
        user,
        response: { status: 200, message: 'User Data' },
      };
    }

    throw new ForbiddenException({
      status: HttpStatus.FORBIDDEN,
      error: 'Email changed or not verified, please verify your email',
    });
  }

  @Query(() => RolesPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async fetchAllRoles(): Promise<RolesPayload> {
    const roles = await this.usersService.findAllRoles();
    if (roles?.length) {
      return {
        roles,
        response: {
          message: 'OK',
          status: 200,
        },
      };
    }

    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Roles not found',
    });
  }

  @Query(() => UsersPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async searchUser(
    @Args('searchUserInput') searchUserInput: SearchUserInput,
  ): Promise<UsersPayload> {
    const users = await this.usersService.search(searchUserInput);

    return {
      users,
      response: { status: 200, message: 'User Data fetched successfully' },
    };
  }

  @Query(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async getUser(@Args('getUser') getUser: GetUser): Promise<UserPayload> {
    const { id } = getUser
    return await this.usersService.findUserById(id);
  }

  // Mutations
  @Mutation(() => AccessUserPayload)
  @UsePipes(new ValidationPipe({ transform: true }))  //for transform to work
  async login(
    @Args('loginUser') loginUserInput: LoginUserInput,
  ): Promise<AccessUserPayload> {
    const { email, password } = loginUserInput;
    const user = await this.usersService.findOne(email, true);

    if (user) {
      if (user.emailVerified) {
        return this.usersService.createToken(user, password);
      }

      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        error: 'Email changed or not verified, please verify your email',
      });
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'User not found',
    });
  }

  @Mutation(() => UserPayload)
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerUser(@Args('user') registerUserInput: RegisterUserInput): Promise<UserPayload> {
    return {
      user: await this.usersService.create(registerUserInput),
      response: { status: 200, message: 'User created successfully' },
    };
  }

  @Mutation(() => ForgotPasswordPayload)
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(
    @Args('forgotPassword') forgotPasswordInput: ForgotPasswordInput,
  ): Promise<ForgotPasswordPayload> {
    const { email } = forgotPasswordInput;
    const user = await this.usersService.forgotPassword(email);

    if (user) {
      return {
        response: {
          status: 200,
          message: 'Forgot Password Email Sent to User',
        },
      };
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'User not found',
    });
  }

  @Mutation(() => UserPayload)
  async verifyEmail(
    @Args('verifyEmail') { token }: VerifyEmailInput,
  ): Promise<UserPayload> {
    const user = await this.usersService.verifyEmail(token);
    if (user) {
      return {
        user,
        response: {
          status: 200,
          message: 'Email verified successfully',
          name: 'Email Verified Successfully',
        },
      };
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Token not found',
    });
  }

  @Mutation(() => UserPayload)
  @UsePipes(new ValidationPipe({ transform: true }))
  async resendVerificationEmail(
    @Args('resendVerificationEmail')
    resendVerificationEmail: ResendVerificationEmail,
  ): Promise<UserPayload> {
    return {
      user: await this.usersService.resendVerificationEmail(
        resendVerificationEmail,
      ),
      response: {
        status: 200,
        message:
          'An email has been sent to you, check your email for verification',
      },
    };
  }

  @Mutation(() => UserPayload)
  async verifyEmailAndSetPassword(
    @Args('verifyEmailAndSetPassword')
    verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput,
  ): Promise<UserPayload> {
    const user = await this.usersService.verifyEmailAndSetPassword(
      verifyEmailAndSetPasswordInput,
    );
    if (user) {
      return {
        user,
        response: {
          status: 200,
          message: 'Email verified successfully',
          name: 'Email Verified Successfully',
        },
      };
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Token not found',
    });
  }

  @Mutation(() => UserPayload)
  async resetPassword(@Args('resetPassword') resetPasswordInput: ResetPasswordInput): Promise<UserPayload> {
    const { token, password } = resetPasswordInput;
    const user = await this.usersService.resetPassword(password, token);
    if (user) {
      return {
        user,
        response: {
          status: 200,
          message: 'Password reset successfully',
          name: 'Password reset successfully',
        },
      };
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Token not found',
    });
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async deactivateUser(
    @Args('user') { userId }: UserIdInput,
  ): Promise<UserPayload> {
    const user = await this.usersService.deactivateUser(userId);
    return { user, response: { status: 200, message: 'User Deactivated' } };
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async activateUser(
    @Args('user') { userId }: UserIdInput,
  ): Promise<UserPayload> {
    const user = await this.usersService.activateUser(userId);
    return { user, response: { status: 200, message: 'User Activated' } };
  }

  @Mutation(() => UserPayload)
  async updateUser(@Args('user') updateUserInput: UpdateUserInput): Promise<UserPayload> {
    const user = await this.usersService.update(updateUserInput);
    return {
      user,
      response: { status: 200, message: 'User Data updated successfully' },
    };
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async updateRole(@Args('user') updateRoleInput: UpdateRoleInput): Promise<UserPayload> {
    const user = await this.usersService.updateRole(updateRoleInput);
    return {
      user,
      response: { status: 200, message: 'User Data updated successfully' },
    };
  }

  @Mutation(() => UserPayload)
  async updatePassword(
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
  ): Promise<UserPayload> {
    const user = await this.usersService.setNewPassword(updatePasswordInput);
    if (user) {
      return {
        user,
        response: {
          status: 200,
          message: 'Password updated successfully',
          name: 'updatePassword',
        },
      };
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'User not found',
    });
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async removeUser(@Args('user') { userId }: UserIdInput) {
    return await this.usersService.remove(userId);
  }
}
