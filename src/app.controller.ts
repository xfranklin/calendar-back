import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller()
export class AppController {
  @Get()
  getHello(@Res() response: Response) {
    response.sendFile("index.html", { root: "./" });
  }
}
