import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { VerifyCallback } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_ID'),
      clientSecret: configService.get<string>('FACEBOOK_SECRET'),
      callbackURL: `${configService.get("APP_BASE_URL")}/users/facebook/callback`,
      profileFields: ['emails', 'name', 'photos'],
      scope: ['email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> {
    const { name, emails, photos } = profile;

    const payload = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    done(null, payload);
  }
}
