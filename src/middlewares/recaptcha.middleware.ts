import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom, map } from "rxjs";
import { Request, Response, NextFunction } from "express";
import { RecaptchaType } from "../types/recaptcha.type";

const THRESHOLD = 0.3;
const API = "https://www.google.com/recaptcha/api/siteverify";

@Injectable()
export class RecaptchaMiddleware implements NestMiddleware {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { body }: { body: { token: string } } = req;
    if (body.token) {
      const url = `${API}?secret=${this.configService.get<string>(
        "RECAPTCHA_SECRET"
      )}&response=${body.token}`;
      const response: RecaptchaType = await lastValueFrom(
        this.httpService.post(url).pipe(map((resp) => resp.data))
      );
      if (response.success && response.score >= THRESHOLD) {
        delete req.body.token;
        next();
      } else {
        throw new HttpException("INVALID_CAPTCHA", HttpStatus.BAD_REQUEST);
      }
    } else {
      throw new HttpException("INVALID_CAPTCHA", HttpStatus.BAD_REQUEST);
    }
  }
}
