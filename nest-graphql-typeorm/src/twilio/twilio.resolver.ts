import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UseFilters } from "@nestjs/common";
import TwilioService from "./twilio.service";
import { HttpExceptionFilter } from "../exception-filter";

@Resolver("twilio")
@UseFilters(HttpExceptionFilter)
export class TwilioResolver {
  constructor(private readonly twilioService: TwilioService) { }
}
