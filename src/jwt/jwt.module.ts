import { Module } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { Refresh } from "./entities/refresh.entity";
import { UserModule } from "../user/user.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [UserModule, MikroOrmModule.forFeature({ entities: [Refresh] })],
  providers: [JwtService],
  exports: [JwtService]
})
export class JwtModule {}
