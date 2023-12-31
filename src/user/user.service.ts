import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./shemas/user.shema";
import { Model } from "mongoose";
import { UserType } from "./types/user.type";
import { Entrypoint, EntrypointDocument } from "./shemas/entrypoint.shema";
import { EntrypointEnum } from "./types/entrypoints.enum";
import { EntrypointType } from "./types/entrypoint.type";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Entrypoint.name)
    private readonly entrypointModel: Model<EntrypointDocument>,
  ) {}

  public async createEntrypoint(
    type: EntrypointEnum,
    data: EntrypointType,
  ): Promise<EntrypointType> {
    return await this.entrypointModel.create({ type, ...data });
  }

  public async findEntrypointByClientId(type: EntrypointEnum, id: string): Promise<EntrypointType> {
    return this.entrypointModel.findOne({ type, clientId: id });
  }

  public async create(user: UserType): Promise<UserType> {
    return await this.userModel.create(user);
  }

  public async findUserById(id: string): Promise<UserType> {
    return this.userModel.findById(id);
  }

  public async findUserByEmail(email: string): Promise<UserType> {
    return this.userModel.findOne({ email }).populate("entrypoints");
  }

  public async findUserByEntryPoint(id: string): Promise<UserType> {
    return this.userModel.findOne({ entrypoints: id });
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return Boolean(user);
  }
}
