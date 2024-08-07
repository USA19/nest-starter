import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  SetMetadata,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UsersPayload } from "./dto/users-payload.dto";
import { JwtAuthRestFulGuard } from "./auth/jwt-auth-restful.guard";
import RestfulRoleGuard from "./auth/roleRestful.guard";
import UsersInput from "./dto/users-input.dto";
import { UserPayload } from "./dto/register-user-payload.dto";
import {
  CurrentUserInterface,
  SocialUserInterface,
} from "./auth/dto/current-user.dto";
import { CurrentUser } from "../customDecorators/current-user.decorator";
import RolesPayload from "./dto/roles-payload.dto";
import {
  ResendVerificationEmail,
  UpdateUserInput,
} from "./dto/update-user-input.dto";
import { LoginUserInput, RefreshTokenInput } from "./dto/login-user-input.dto";
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
import { JwtRefreshTokenRestFulGuard } from "./auth/refresh-jwt-auth-restful-guard";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) { }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UsersPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async fetchAllUsers(
    @Query(ValidationPipe) usersInput: UsersInput
  ): Promise<UsersPayload> {
    return await this.usersService.findAll(usersInput);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard)
  async me(
    @CurrentUser() currentUser: CurrentUserInterface
  ): Promise<UserPayload> {
    const { email } = currentUser;
    const user = await this.usersService.findOne(email);
    if (user?.emailVerified) {
      return {
        user,
        response: { status: 200, message: "User Data" },
      };
    }

    throw new ForbiddenException(
      "Email changed or not verified, please verify your email"
    );
  }

  @Get("roles")
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: RolesPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async fetchAllRoles(): Promise<RolesPayload> {
    return await this.usersService.findAllRoles();
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() _req: Request) { }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuth(@Req() _req: Request) { }

  @Get("github")
  @UseGuards(AuthGuard("github"))
  async githubAuth(@Req() _req: Request) { }

  @Get("/:id")
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async getUserById(@Param("id") id: string): Promise<UserPayload> {
    return await this.usersService.findUserById(id);
  }

  @Post("login")
  @ApiResponse({
    status: 200,
    description: "User found",
    type: AccessUserPayload,
  })
  @UsePipes(new ValidationPipe({ transform: true })) //for transform to work
  async login(
    @Body() loginUserInput: LoginUserInput
  ): Promise<AccessUserPayload> {
    return await this.usersService.login(loginUserInput);
  }

  @Post("refresh-token")
  @UseGuards(JwtRefreshTokenRestFulGuard)
  @ApiResponse({
    status: 200,
    description: "Refresh Token",
    type: AccessUserPayload,
  })
  async refreshToken(
    @Body() loginUserInput: RefreshTokenInput
  ): Promise<AccessUserPayload> {
    const { refreshToken } = loginUserInput;
    return await this.usersService.refreshToken(refreshToken);
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @CurrentUser() currentUser: SocialUserInterface,
    @Res() res: Response
  ) {
    const { email, firstName, lastName } = currentUser || {};
    const response = await this.usersService.socialAuth({
      email,
      firstName,
      lastName,
      roleType: UserRole.USER,
    });

    if (response) {
      const { access_token, refresh_token } = response;
      res.redirect(
        `${this.configService.get("SOCIAL_AUTH_REDIRECT_URL")}?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    }
  }

  @Get("facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuthRedirect(
    @CurrentUser() currentUser: SocialUserInterface,
    @Res() res: Response
  ) {
    const { email, firstName, lastName } = currentUser || {};
    const response = await this.usersService.socialAuth({
      email,
      firstName,
      lastName,
      roleType: UserRole.ADMIN,
    });

    if (response) {
      const { access_token, refresh_token } = response;
      res.redirect(
        `${this.configService.get("SOCIAL_AUTH_REDIRECT_URL")}?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    }
  }

  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubAuthRedirect(
    @CurrentUser() currentUser: SocialUserInterface,
    @Res() res: Response
  ) {
    const { email, firstName, lastName } = currentUser || {};
    const response = await this.usersService.socialAuth({
      email,
      firstName,
      lastName,
      roleType: UserRole.ADMIN,
    });

    if (response) {
      const { access_token, refresh_token } = response;
      res.redirect(
        `${this.configService.get("SOCIAL_AUTH_REDIRECT_URL")}?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    }
  }

  @Post("register")
  @ApiResponse({ status: 200, type: UserPayload })
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerUser(
    @Body() registerUserInput: RegisterUserInput
  ): Promise<UserPayload> {
    return {
      user: await this.usersService.create(registerUserInput),
      response: { status: 200, message: "User created successfully" },
    };
  }

  @Post("forgotPassword")
  @ApiResponse({ status: 200, type: ForgotPasswordPayload })
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(
    @Body() forgotPasswordInput: ForgotPasswordInput
  ): Promise<ForgotPasswordPayload> {
    return await this.usersService.forgotPassword(forgotPasswordInput);
  }

  @Post("verifyEmail")
  @ApiResponse({ status: 200, type: UserPayload })
  async verifyEmail(@Body() { token }: VerifyEmailInput): Promise<UserPayload> {
    return await this.usersService.verifyEmail(token);
  }

  @Post("resendVerificationEmail")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({ status: 200, type: ResendVerificationEmail })
  async resendVerificationEmail(
    @Body() resendVerificationEmail: ResendVerificationEmail
  ): Promise<UserPayload> {
    return await this.usersService.resendVerificationEmail(
      resendVerificationEmail
    );
  }

  @Post("verifyEmailAndSetPasswordInput")
  @ApiResponse({ status: 200, type: UserPayload })
  async verifyEmailAndSetPassword(
    @Body() verifyEmailAndSetPasswordInput: VerifyUserAndUpdatePasswordInput
  ): Promise<UserPayload> {
    return await this.usersService.verifyEmailAndSetPassword(
      verifyEmailAndSetPasswordInput
    );
  }

  @Post("resetPassword")
  @ApiResponse({ status: 200, type: UserPayload })
  async resetPassword(
    @Body() resetPasswordInput: ResetPasswordInput
  ): Promise<UserPayload> {
    const { token, password } = resetPasswordInput;
    return await this.usersService.resetPassword(password, token);
  }

  @Post("deactivateUser")
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async deactivateUser(@Body() { userId }: UserIdInput): Promise<UserPayload> {
    return await this.usersService.deactivateUser(userId);
  }

  @Post("activateUser")
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async activateUser(@Body() { userId }: UserIdInput): Promise<UserPayload> {
    return await this.usersService.activateUser(userId);
  }

  @Put("update/:id")
  @ApiResponse({ status: 200, type: UserPayload })
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserInput: UpdateUserInput
  ): Promise<UserPayload> {
    return await this.usersService.update(updateUserInput, id);
  }

  @Put("updateRole/:id")
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async updateRole(
    @Param("id") id: string,
    @Body() updateRoleInput: UpdateRoleInput
  ): Promise<UserPayload> {
    return await this.usersService.updateRole(updateRoleInput, id);
  }

  @Put("updatePassword/:id")
  @ApiResponse({ status: 200, type: UserPayload })
  async updatePassword(
    @Param("id") id: string,
    @Body() updatePasswordInput: UpdatePasswordInput
  ): Promise<UserPayload> {
    return await this.usersService.setNewPassword(updatePasswordInput, id);
  }

  @Delete("/:id")
  @ApiResponse({ status: 200, type: UserPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata("roles", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async removeUser(@Param("id") id: string): Promise<UserPayload> {
    return await this.usersService.remove(id);
  }
}
