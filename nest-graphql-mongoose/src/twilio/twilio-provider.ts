import { ConfigService } from "@nestjs/config";
import { Twilio } from 'twilio';

export const TwilioProvider = {
  provide: 'Twilio',
  useFactory: async (configService: ConfigService) => {
    return new Twilio(
      configService.get('TWILIO_ACCOUNT_SID'),
      configService.get('TWILIO_AUTH_TOKEN'),
    );
  },
  inject: [ConfigService],
}