import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Twilio } from "twilio";
import { ConfigService } from "@nestjs/config";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

@Injectable()
export default class TwilioService {
  constructor(
    @Inject("Twilio")
    private readonly twilioClient: Twilio,
    private readonly configService: ConfigService,
  ) { }

  /**
   *
   * @param to
   * @returns VerificationInstance
   */
  async sendVerificationCode(to: string): Promise<VerificationInstance> {
    try {
      return await this.twilioClient.verify.v2
        .services(this.configService.get("TWILIO_SERVICE_SID"))
        .verifications.create({ to, channel: "sms" });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param to
   * @param code
   * @returns
   */
  async verifyOtpCode(to: string, code: string): Promise<VerificationCheckInstance> {
    try {
      return await this.twilioClient.verify.v2
        .services(this.configService.get("TWILIO_SERVICE_SID"))
        .verificationChecks.create({ to, code });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
