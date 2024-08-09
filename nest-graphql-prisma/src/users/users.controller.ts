import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import {
  SocialUserInterface,
} from "./auth/dto/current-user.dto";
import { CurrentUser } from "../customDecorators/current-user.decorator";
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

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() _req: Request) { }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuth(@Req() _req: Request) { }

  @Get("github")
  @UseGuards(AuthGuard("github"))
  async githubAuth(@Req() _req: Request) { }

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

}
