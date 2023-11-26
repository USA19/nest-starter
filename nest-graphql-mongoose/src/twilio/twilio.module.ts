import { Module } from "@nestjs/common";
import { TwilioProvider } from "./twilio-provider";
import TwilioService from "./twilio.service";
import { TwilioResolver } from "./twilio.resolver";

@Module({
  imports: [],
  controllers: [],
  providers: [TwilioProvider, TwilioService, TwilioResolver],
  exports: [TwilioService],
})
export class TwilioModule { }
