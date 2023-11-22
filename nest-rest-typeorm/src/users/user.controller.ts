
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Query, Request, SetMetadata, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { ApiResponse, ApiTags, ApiQuery, ApiParam } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UsersPayload } from "./dto/users-payload.dto";
import { JwtAuthRestFulGuard } from "./auth/jwt-auth-restful.guard";
import RestfulRoleGuard from "./auth/roleRestful.guard";
import UsersInput from "./dto/users-input.dto";
import { UserPayload } from "./dto/register-user-payload.dto";
import { CurrentUserInterface } from "./auth/dto/current-user.dto";
import { CurrentUser } from "src/customDecorators/current-user.decorator";
import RolesPayload from "./dto/roles-payload.dto";
import { SearchUserInput } from "./dto/search-user.input";
import { GetUser, ResendVerificationEmail, UpdateUserInput } from "./dto/update-user-input.dto";
import { LoginUserInput } from "./dto/login-user-input.dto";
import { AccessUserPayload } from "./dto/access-user.dto";
import { RegisterUserInput } from "./dto/register-user-input.dto";
import { ForgotPasswordInput } from "./dto/forget-password-input.dto";
import { ForgotPasswordPayload } from "./dto/forgot-password-payload.dto";
import { VerifyEmailInput } from "./dto/verify-email-input.dto";
import { VerifyUserAndUpdatePasswordInput } from "./dto/verify-user-and-set-password.dto";
import { ResetPasswordInput } from "./dto/reset-password-input.dto";
import { UserIdInput } from "./dto/user-id-input.dto";
import { UpdateRoleInput } from "./dto/update-role-input.dto";
import { UpdatePasswordInput } from "./dto/update-password-input";

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiQuery({ type: UsersInput, required: true, name: 'UsersInput' })
  @ApiResponse({ status: 200, type: UsersPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async fetchAllUsers(@Query('userInput') usersInput: UsersInput): Promise<UsersPayload> {
    return await this.usersService.findAll(usersInput);
  }

  @Get('me')
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard)
  async me(@CurrentUser() currentUser: CurrentUserInterface): Promise<UserPayload> {
    const { email } = currentUser
    const user = await this.usersService.findOne(email);
    if (user?.emailVerified) {
      return {
        user,
        response: { status: 200, message: 'User Data' },
      };
    }

    throw new ForbiddenException('Email changed or not verified, please verify your email');
  }

  @Get('roles')
  @ApiResponse({ status: 200, type: RolesPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
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

    throw new NotFoundException('Roles not found');
  }

  @Get('search')
  @ApiQuery({ type: SearchUserInput, required: true, name: 'SearchUserInput' })
  @ApiResponse({ status: 200, type: UsersPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async searchUser(@Query('searchUserInput') searchUserInput: SearchUserInput): Promise<UsersPayload> {
    return {
      users: await this.usersService.search(searchUserInput),
      response: { status: 200, message: 'User Data fetched successfully' },
    };
  }

  @Get('/:id')
  @ApiParam({ type: GetUser, required: true, name: 'GetUserParam' })
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async getUserById(@Param('id') id: string): Promise<UserPayload> {
    return await this.usersService.findUserById(id);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))  //for transform to work
  async login(@Body() loginUserInput: LoginUserInput): Promise<AccessUserPayload> {
    const { email, password } = loginUserInput;
    const user = await this.usersService.findOne(email, true);

    if (user) {
      if (user.emailVerified) {
        return this.usersService.createToken(user, password);
      }

      throw new ForbiddenException('Email changed or not verified, please verify your email');
    }

    throw new NotFoundException('User not found');
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerUser(@Body() registerUserInput: RegisterUserInput): Promise<UserPayload> {
    return {
      user: await this.usersService.create(registerUserInput),
      response: { status: 200, message: 'User created successfully' },
    };
  }

  @Post('forgotPassword')
  @ApiResponse({ status: 200, type: ForgotPasswordPayload })
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Body() forgotPasswordInput: ForgotPasswordInput): Promise<ForgotPasswordPayload> {
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

    throw new NotFoundException('User not found');
  }

  @Post('verifyEmail')
  @ApiResponse({ status: 200, type: UserPayload })
  async verifyEmail(@Body() { token }: VerifyEmailInput): Promise<UserPayload> {
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

    throw new NotFoundException('Verification Token not Found');
  }

  @Post('resendVerificationEmail')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({ status: 200, type: ResendVerificationEmail })
  async resendVerificationEmail(@Body() resendVerificationEmail: ResendVerificationEmail): Promise<UserPayload> {
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

  @Post('verifyEmailAndSetPasswordInput')
  @ApiResponse({ status: 200, type: UserPayload })
  async verifyEmailAndSetPassword(@Body() verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput): Promise<UserPayload> {
    const user = await this.usersService.verifyEmailAndSetPassword(verifyEmailAndSetPasswordInput);
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

    throw new NotFoundException('Token not found');
  }

  @Post('resetPassword')
  @ApiResponse({ status: 200, type: UserPayload })
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput): Promise<UserPayload> {
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

    throw new NotFoundException('Token not found');
  }

  @Post('deactivateUser')
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async deactivateUser(@Body() { userId }: UserIdInput): Promise<UserPayload> {
    const user = await this.usersService.deactivateUser(userId);
    return { user, response: { status: 200, message: 'User Deactivated' } };
  }

  @Post('activateUser')
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async activateUser(@Body() { userId }: UserIdInput): Promise<UserPayload> {
    const user = await this.usersService.activateUser(userId);
    return { user, response: { status: 200, message: 'User Activated' } };
  }

  @Put('update/:id')
  @ApiParam({ type: GetUser, required: true, name: 'UpdateUserParams' })
  @ApiResponse({ status: 200, type: UserPayload })
  async updateUser(@Param('id') id: string, @Body() updateUserInput: UpdateUserInput): Promise<UserPayload> {
    const user = await this.usersService.update({ ...updateUserInput, id });
    return {
      user,
      response: { status: 200, message: 'User updated successfully' },
    };
  }


  @Put('updateRole/:id')
  @ApiParam({ type: GetUser, required: true, name: 'UpdateRoleParams' })
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async updateRole(@Param('id') id: string, @Body() updateRoleInput: UpdateRoleInput): Promise<UserPayload> {
    const user = await this.usersService.updateRole({ ...updateRoleInput, id });

    return {
      user,
      response: { status: 200, message: 'User Data updated successfully' },
    };
  }

  @Put('updatePassword/:id')
  @ApiParam({ type: GetUser, required: true, name: 'UpdatePasswordParams' })
  @ApiResponse({ status: 200, type: UserPayload })
  async updatePassword(@Param('id') id: string, @Body() updatePasswordInput: UpdatePasswordInput): Promise<UserPayload> {
    const user = await this.usersService.setNewPassword({ ...updatePasswordInput, id });
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

    throw new NotFoundException('User not found');
  }

  @Delete('/:id')
  @ApiParam({ type: GetUser, required: true, name: 'DeleteUserParams' })
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async removeUser(@Param('id') id: string): Promise<UserPayload> {
    return await this.usersService.remove(id);
  }
}