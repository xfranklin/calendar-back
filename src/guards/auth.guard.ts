import {
  HttpException,
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { RoleEnum } from "../user/types/roles.enum";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const noAuth = this.reflector.get<string[]>(
      "no-auth",
      context.getHandler(),
    );
    if (noAuth) {
      return true;
    }

    const { cookies } = context.switchToHttp().getRequest();
    const { ACCESS_TOKEN } = cookies;
    let userRole;
    try {
      const { role } = jwt.verify(
        ACCESS_TOKEN,
        this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      );
      userRole = role;
    } catch (e) {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }

    const allowRoles: RoleEnum[] = this.reflector.get<RoleEnum[]>(
      "roles",
      context.getHandler(),
    );
    if (allowRoles.includes(userRole)) {
      return true;
    } else {
      throw new HttpException("WITHOUT_PERMISSION", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
  }
}
