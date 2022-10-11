import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom, map } from "rxjs";
import { NextFunction, Request, Response } from "express";
import { RecaptchaType } from "../types/recaptcha.type";
import { RecaptchaTokenDto } from "../auth/dto/recaptcha-token.dto";

const THRESHOLD = 0.3;
const API = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Middleware to check if request has passed google recaptcha.
 * Check disabled in development
 */
@Injectable()
export class RecaptchaMiddleware implements NestMiddleware {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body: RecaptchaTokenDto = req.body;
    if (process.env.NODE_ENV === "development") return next();

    if (body.token) {
      const url = `${API}?secret=${this.configService.get<string>(
        "RECAPTCHA_SECRET"
      )}&response=${body.token}`;
      const response: RecaptchaType = await lastValueFrom(
        this.httpService.post(url).pipe(map((resp) => resp.data))
      );
      if (response.success && response.score >= THRESHOLD) {
        delete req.body.token;
        return next();
      }
    }

    throw new HttpException("INVALID_CAPTCHA", HttpStatus.BAD_REQUEST);
  }
}
