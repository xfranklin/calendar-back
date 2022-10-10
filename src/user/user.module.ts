import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MailSenderModule } from "../mailsender/mail-sender.module";
import { User } from "./entities/user.entity";
import { Entrypoint } from "./entities/entrypoint.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User] }),
    MikroOrmModule.forFeature({ entities: [Entrypoint] }),
    MailSenderModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
