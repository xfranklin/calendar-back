import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Refresh, RefreshDocument } from "./shemas/refresh.shema";
import { Model } from "mongoose";
import * as jwt from "jsonwebtoken";
import { UserType } from "../user/types/user.type";
import { Response } from "express";
import { UserService } from "../user/user.service";

@Injectable()
export class JwtService {
  constructor(
    @InjectModel(Refresh.name)
    private readonly refreshModel: Model<RefreshDocument>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  public setCookies(
    access: string,
    refresh: string,
    response: Response,
    redirect?: boolean,
  ) {
    response
      .cookie("ACCESS_TOKEN", access, {
        httpOnly: true,
        domain: "localhost",
      })
      .cookie("REFRESH_TOKEN", refresh, {
        httpOnly: true,
        domain: "localhost",
      });
    if (redirect) {
      response.redirect(this.configService.get<string>("APP_URL"));
    } else {
      response.status(HttpStatus.OK).json({ status: HttpStatus.OK });
    }
  }

  public clearCookies(response: Response) {
    response
      .clearCookie("ACCESS_TOKEN", { httpOnly: true, domain: "localhost" })
      .clearCookie("REFRESH_TOKEN", { httpOnly: true, domain: "localhost" })
      .status(HttpStatus.OK)
      .json({ status: HttpStatus.OK });
  }

  public generateAccessToken({
    _id,
    email,
    role,
    isVerified,
  }: UserType): string {
    const token = jwt.sign(
      { type: "ACCESS", id: _id, email, role, isVerified },
      this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      {
        expiresIn: Number(this.configService.get<string>("ACCESS_EXPIRATION")),
      },
    );
    return token;
  }

  public async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { type: "REFRESH", id: userId },
      this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: Number(this.configService.get<string>("REFRESH_EXPIRATION")),
      },
    );
    const { refreshToken } = await this.refreshModel.create({
      userId,
      refreshToken: token,
    });
    return refreshToken;
  }

  public async refreshToken(
    REFRESH_TOKEN: string,
    ACCESS_TOKEN: string,
    response: Response,
  ) {
    this.isAccessTokenExpired(ACCESS_TOKEN);
    this.validateRefreshToken(REFRESH_TOKEN);
    const { userId, _id } = await this.findRefreshToken(REFRESH_TOKEN);
    await this.deleteRefreshById(_id);
    const refreshToken = await this.generateRefreshToken(userId);
    const user = await this.userService.findUserById(userId);
    const accessToken = this.generateAccessToken(user);
    this.setCookies(accessToken, refreshToken, response);
  }

  public async deleteRefreshToken(refreshToken: string) {
    await this.refreshModel.deleteOne({ refreshToken });
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************
  private async findRefreshToken(token: string) {
    const refreshToken = await this.refreshModel.findOne({
      refreshToken: token,
    });
    if (!refreshToken) {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
    return refreshToken;
  }

  private validateRefreshToken(token: string) {
    try {
      jwt.verify(token, this.configService.get<string>("REFRESH_TOKEN_SECRET"));
    } catch {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
  }

  private isAccessTokenExpired(token: string) {
    try {
      jwt.verify(token, this.configService.get<string>("ACCESS_TOKEN_SECRET"));
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        return;
      }
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException("ACCESS_TOKEN_NOT_EXPIRED", HttpStatus.BAD_REQUEST);
  }

  private async deleteRefreshById(id: string) {
    await this.refreshModel.deleteOne({ _id: id });
  }
}
