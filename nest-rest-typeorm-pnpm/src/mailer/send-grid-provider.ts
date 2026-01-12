import { ConfigService } from "@nestjs/config"
import sgMail from '@sendgrid/mail';

export const SendGridMailer = {
  provide: 'SENDGRID',
  useFactory: async (configService: ConfigService) => {
    const apiKey = configService.get<string>('SENDGRID_API_KEY')

    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.warn('[Mailer] SENDGRID_API_KEY is not set. Email sending is disabled.')

      const noopMailer: sgMail.MailService = {
        send: async () => {
          return [{
            statusCode: 200,
            body: '',
            headers: {},
          } as any]
        },
        setApiKey: () => { },
        setClient: () => { },
        setTwilioEmailAuth: () => { },
        setTimeout: () => { },
      } as unknown as sgMail.MailService

      return noopMailer
    }

    sgMail.setApiKey(apiKey)
    return sgMail
  },
  inject: [ConfigService],
}