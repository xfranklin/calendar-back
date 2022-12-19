import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "../jwt/jwt.module";
import { UserModule } from "../user/user.module";
import { SocialsModule } from "../socials/socials.module";
import { HttpModule } from "@nestjs/axios";
import { SocialController } from "./social.controller";

@Module({
  imports: [
    HttpModule.register({ timeout: 3000 }),
    JwtModule,
    UserModule,
    SocialsModule
  ],
  controllers: [AuthController, SocialController],
  providers: [AuthService]
})
export class AuthModule implements NestModule {
  configure(_consumer: MiddlewareConsumer): void {
    //
  }
}
