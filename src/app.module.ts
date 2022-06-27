import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "./jwt/jwt.module";
import { UserModule } from "./user/user.module";
import { MailSenderModule } from "./mailsender/mail-sender.module";
import { SocialsModule } from "./socials/socials.module";

console.log(process.env.MONGO_URI);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    JwtModule,
    UserModule,
    MailSenderModule,
    SocialsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
