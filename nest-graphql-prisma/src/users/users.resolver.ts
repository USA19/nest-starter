import { HttpStatus, UseFilters, UseGuards, SetMetadata, ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { LoginUserInput, RefreshTokenInput } from './dto/login-user-input.dto';
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
import { UpdatePasswordInput } from './dto/update-password-input';
import { JwtRefreshTokenGraphqlGuard } from './auth/refresh-jwt-auth-graphql-guard';

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
    return await this.usersService.findAllRoles();
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
  @UseGuards(JwtRefreshTokenGraphqlGuard)
  async refreshToken(
    @Args('refreshTokenInput') loginUserInput: RefreshTokenInput
  ): Promise<AccessUserPayload> {
    const { refreshToken } = loginUserInput;
    return await this.usersService.refreshToken(refreshToken);
  }

  @Mutation(() => AccessUserPayload)
  @UsePipes(new ValidationPipe({ transform: true }))  //for transform to work
  async login(
    @Args('loginUser') loginUserInput: LoginUserInput,
  ): Promise<AccessUserPayload> {
    return await this.usersService.login(loginUserInput)
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
    return await this.usersService.forgotPassword(forgotPasswordInput);
  }

  @Mutation(() => UserPayload)
  async verifyEmail(
    @Args('verifyEmail') { token }: VerifyEmailInput,
  ): Promise<UserPayload> {
    return await this.usersService.verifyEmail(token);
  }

  @Mutation(() => UserPayload)
  @UsePipes(new ValidationPipe({ transform: true }))
  async resendVerificationEmail(
    @Args('resendVerificationEmail')
    resendVerificationEmail: ResendVerificationEmail,
  ): Promise<UserPayload> {
    return await this.usersService.resendVerificationEmail(resendVerificationEmail)
  }

  @Mutation(() => UserPayload)
  async verifyEmailAndSetPassword(
    @Args('verifyEmailAndSetPassword')
    verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput,
  ): Promise<UserPayload> {
    return await this.usersService.verifyEmailAndSetPassword(
      verifyEmailAndSetPasswordInput,
    );
  }

  @Mutation(() => UserPayload)
  async resetPassword(@Args('resetPassword') resetPasswordInput: ResetPasswordInput): Promise<UserPayload> {
    const { token, password } = resetPasswordInput;
    return await this.usersService.resetPassword(password, token);
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async deactivateUser(
    @Args('user') { userId }: UserIdInput,
  ): Promise<UserPayload> {
    return await this.usersService.deactivateUser(userId);
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async activateUser(
    @Args('user') { userId }: UserIdInput,
  ): Promise<UserPayload> {
    return await this.usersService.activateUser(userId);
  }

  @Mutation(() => UserPayload)
  async updateUser(@Args('user') updateUserInput: UpdateUserInput): Promise<UserPayload> {
    return await this.usersService.update(updateUserInput);
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async updateRole(@Args('user') updateRoleInput: UpdateRoleInput): Promise<UserPayload> {
    return await this.usersService.updateRole(updateRoleInput);
  }

  @Mutation(() => UserPayload)
  async updatePassword(
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
  ): Promise<UserPayload> {
    return await this.usersService.setNewPassword(updatePasswordInput);
  }

  @Mutation(() => UserPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async removeUser(@Args('user') { userId }: UserIdInput) {
    return await this.usersService.remove(userId);
  }
}
