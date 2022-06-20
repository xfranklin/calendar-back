import { Module } from "@nestjs/common";
import { MailSenderService } from "./mail-sender.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MailLimits, MailLimitsSchema } from "./shemas/mail-limits.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailLimits.name, schema: MailLimitsSchema },
    ]),
  ],
  providers: [MailSenderService],
  exports: [MailSenderService],
})
export class MailSenderModule {}
