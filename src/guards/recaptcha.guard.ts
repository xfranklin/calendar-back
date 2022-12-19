import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, map } from "rxjs";
import { FastifyRequest } from "fastify";
import { RecaptchaType } from "../types/recaptcha.type";

const THRESHOLD = 0.3;
const API = "https://www.google.com/recaptcha/api/siteverify";

/**
 * guard to check if request has passed google recaptcha.
 * Check disabled in development
 */
@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV === "development") return true;

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();

    const url = `${API}?secret=${this.configService.get<string>(
      "RECAPTCHA_SECRET"
    )}&response=${request.body as { token: string }}).token}`;

    const isSuccess = await firstValueFrom(
      this.httpService
        .post<RecaptchaType>(url)
        .pipe(map(({ data }) => data.success && data.score >= THRESHOLD))
    );

    if (isSuccess) return true;

    throw new HttpException("INVALID_CAPTCHA", HttpStatus.BAD_REQUEST);
  }
}
