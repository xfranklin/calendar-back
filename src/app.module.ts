import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "./jwt/jwt.module";
import { UserModule } from "./user/user.module";
import { MailSenderModule } from "./mailsender/mail-sender.module";
import { SocialsModule } from "./socials/socials.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PlannerModule } from "./planner/planner.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          registerRequestContext: true,
          type: "mongo",
          clientUrl: configService.get<string>("MONGO_URI"),
          entities: ["./**/*.entity.js"],
          entitiesTs: ["./**/*.entity.ts"],
          debug: process.env.NODE_ENV !== "production",
          ensureIndexes: true
        };
      },
      inject: [ConfigService]
    }),
    AuthModule,
    JwtModule,
    UserModule,
    SocialsModule,
    MailSenderModule,
    PlannerModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
