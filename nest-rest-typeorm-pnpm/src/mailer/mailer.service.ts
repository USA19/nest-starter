import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import { TemplateSwitch } from './dto/dynamicTemplateData.dto';

@Injectable()
export class MailerService {

  constructor(
    private readonly configService: ConfigService,
    @Inject('SENDGRID')
    private readonly sgMail: MailService,
  ) { }

  templateSwitch = (templateName: TemplateSwitch) =>
  ({
    verifyEmail: 'VERIFY_EMAIL_TEMPLATE_ID',
    newSignUp: "NEW_SIGNUP_TEMPLATE_ID",
    forgetPassword: "FORGET_PASSWORD_TEMPLATE_ID",
    resetPassword: "RESET_PASSWORD_TEMPLATE_ID",
    setPassword: "SET_PASSWORD_TEMPLATE_ID",
  }[templateName]);

  portalRouteSwitch = (templateName: TemplateSwitch) =>
  ({
    newSignUp: "/login",
    verifyEmail: "/verify-email",
    forgetPassword: "/reset-password",
    resetPassword: "/reset-password",
    setPassword: "/set-password",
  }[templateName]);

  portalSubujectSwitch = (templateName: TemplateSwitch) =>
  ({
    newSignUp: "Welcome to Orcha Flow",
    verifyEmail: "Verify Your Email",
    forgetPassword: "Password Reset Request",
    resetPassword: "Reset Your Password",
    setPassword: "Set Your Password",
  }[templateName]);


  /**
   * 
   * @param email 
   * @param fullName 
   * @param token 
   * @param templateName 
   */
  async sendEmail(email: string, fullName: string, token: string, templateName: TemplateSwitch): Promise<void> {
    try {
      const msg = {
        to: email,
        from: this.configService.get('FROM_EMAIL'),
        templateId: this.configService.get(this.templateSwitch(templateName)),
        dynamicTemplateData: {
          subject: this.portalSubujectSwitch(templateName),
          token,
          fullName,
          portalUrl: `${this.configService.get('PORTAL_APP_BASE_URL')}${this.portalRouteSwitch(templateName)}?token=${token}`,
        },
      };

      await this.sgMail.send(msg);
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}
