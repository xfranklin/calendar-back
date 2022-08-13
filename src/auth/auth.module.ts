import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "../jwt/jwt.module";
import { UserModule } from "../user/user.module";
import { SocialsModule } from "../socials/socials.module";
import { RecaptchaMiddleware } from "../middlewares/recaptcha.middleware";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule.register({ timeout: 3000 }),
    JwtModule,
    UserModule,
    SocialsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RecaptchaMiddleware)
      .forRoutes(
        { path: "/auth/signup", method: RequestMethod.POST },
        { path: "/auth/login", method: RequestMethod.POST },
      );
  }
}
