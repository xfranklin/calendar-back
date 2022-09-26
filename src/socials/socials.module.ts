import { Module } from "@nestjs/common";
import { SocialsService } from "./socials.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule.register({ timeout: 3000 })],
  providers: [SocialsService],
  exports: [SocialsService]
})
export class SocialsModule {}
