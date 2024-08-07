import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SES } from "aws-sdk";
import { resolve } from 'path';
import * as ejs from 'ejs';
import { TemplateSwitch } from "./dto/dynamicTemplateData.dto";

@Injectable()
export class AwsSimpleEmailService {
  private readonly emailTemplatesFolder = process.cwd() + '/src/templates';

  constructor(
    private readonly configService: ConfigService,
    @Inject('AWS_SES')
    private readonly sesClient: SES // AWS email service Client
  ) { }

  // use this incase ejs template
  templateSwitch = (templateName: TemplateSwitch) =>
  ({
    verifyEmail: './verifyEmail.ejs',
    newSignUp: "./newSignUp.ejs",
    forgetPassword: "./forgetPassword.ejs",
    resetPassword: "./resetPassword.ejs",
    setPassword: "./verifyEmail.ejs",
  }[templateName]);

  portalRouteSwitch = (templateName: TemplateSwitch) =>
  ({
    newSignUp: "/login",
    verifyEmail: "/verify-email",
    forgetPassword: "/reset-password",
    resetPassword: "/reset-password",
    setPassword: "/set-password",
  }[templateName]);


  emailSubjectSwitch = (templateName: TemplateSwitch) =>
  ({
    newSignUp: "Welcome to Platform",
    verifyEmail: "Verify Email",
    forgetPassword: "Reset Your Password",
    resetPassword: "Reset Your Password",
    setPassword: "Activate your Account",
  }[templateName]);

  /**
   * 
   * @param email 
   * @param fullName 
   * @param token 
   */
  async sendEmail(email: string, fullName: string, token: string, templateName: TemplateSwitch) {
    const portalUrl = '';

    try {
      const html = await ejs.renderFile(resolve(this.emailTemplatesFolder, this.templateSwitch(templateName)), { portalUrl, fullName });
      const params = {
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: this.emailSubjectSwitch(templateName),
          },
        },

        Source: `"Company" <${this.configService.get('INVITE_FROM_EMAIL')}>`
      };

      this.sesClient.sendEmail(params).promise();
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}