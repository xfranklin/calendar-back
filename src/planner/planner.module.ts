import { Module } from "@nestjs/common";
import { PlannerService } from "./planner.service";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  providers: [PlannerService],
  imports: [ScheduleModule.forRoot()]
})
export class PlannerModule {}
