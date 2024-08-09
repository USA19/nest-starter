import { Module } from "@nestjs/common";
import { TwilioProvider } from "./twilio-provider";
import TwilioService from "./twilio.service";

@Module({
  imports: [],
  controllers: [],
  providers: [TwilioProvider, TwilioService],
  exports: [TwilioService],
})
export class TwilioModule { }
