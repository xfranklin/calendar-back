import { Module } from "@nestjs/common";
import { MailSenderService } from "./mail-sender.service";
import { MailLimits } from "./entities/mail-limits.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [MailLimits] })],
  providers: [MailSenderService],
  exports: [MailSenderService]
})
export class MailSenderModule {}
