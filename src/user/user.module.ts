import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MailSenderModule } from "../mailsender/mail-sender.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./shemas/user.shema";
import { Entrypoint, EntrypointSchema } from "./shemas/entrypoint.shema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Entrypoint.name, schema: EntrypointSchema }
    ]),
    MailSenderModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
