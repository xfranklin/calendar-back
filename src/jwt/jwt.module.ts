import { Module } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Refresh, RefreshSchema } from "./shemas/refresh.shema";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Refresh.name, schema: RefreshSchema }]),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
