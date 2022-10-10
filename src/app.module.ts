import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "./jwt/jwt.module";
import { UserModule } from "./user/user.module";
import { MailSenderModule } from "./mailsender/mail-sender.module";
import { SocialsModule } from "./socials/socials.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: "mongo",
          clientUrl: configService.get<string>("MONGO_URI"),
          entities: ["dist/**/*.entity.js"],
          entitiesTs: ["src/**/*.entity.ts"],
          debug: process.env.NODE_ENV !== "production"
        };
      },
      inject: [ConfigService]
    }),
    AuthModule,
    JwtModule,
    UserModule,
    MailSenderModule,
    SocialsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
