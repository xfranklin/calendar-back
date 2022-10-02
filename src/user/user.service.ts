import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./shemas/user.shema";
import { Model } from "mongoose";
import { UserType } from "./types/user.type";
import { Entrypoint, EntrypointDocument } from "./shemas/entrypoint.shema";
import { EntrypointEnum } from "./types/entrypoints.enum";
import { EntrypointType } from "./types/entrypoint.type";
import { getUser } from "./helpers/getUser";
import { MailSenderService} from "../mailsender/mail-sender.service";
import { LettersEnum} from "../mailsender/types/letters.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Entrypoint.name)
    private readonly entrypointModel: Model<EntrypointDocument>,
    private readonly mailSenderService: MailSenderService
  ) {}

  // TODO DElETE ME
  public async testSend() {
    await this.mailSenderService.sendMail(
      "d.feleniuk@oooi.app",
      LettersEnum.EMAIL_VERIFICATION,
      { user_name: "test Name", verify_link: "https://www.google.com/" }
    );
  }

  // ┌┬┐┌─┐
  // │││├┤
  // ┴ ┴└─┘
  public async me(id: string): Promise<UserType> {
    const user = await this.findUserById(id);
    return getUser(user);
  }

  // ┌─┐┌┐┌┌┐ ┌─┐┌─┐┬─┐┌┬┐┬┌┐┌┌─┐
  // │ ││││├┴┐│ │├─┤├┬┘ │││││││ ┬
  // └─┘┘└┘└─┘└─┘┴ ┴┴└──┴┘┴┘└┘└─┘
  public async onboard(id: string, personalInfo) {
    const birthday = new Date(personalInfo.birthday);
    const updatedUser: UserType = (
      await this.userModel.findByIdAndUpdate(
        id,
        {
          ...personalInfo,
          birthday,
          isOnboarded: true
        },
        { new: true }
      )
    ).toObject();
    // TO DO SEND CONFIRM EMAIL
    return { user: getUser(updatedUser) };
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************
  public async createEntrypoint(
    type: EntrypointEnum,
    data: EntrypointType
  ): Promise<EntrypointType> {
    return await this.entrypointModel.create({ type, ...data });
  }

  public async findEntrypointByClientId(
    type: EntrypointEnum,
    id: string
  ): Promise<EntrypointType> {
    return this.entrypointModel.findOne({ type, clientId: id });
  }

  public async create(user: UserType): Promise<UserType> {
    return (await this.userModel.create(user))?.toObject();
  }

  public async findUserById(id: string): Promise<UserType> {
    return (await this.userModel.findById(id))?.toObject();
  }

  public async findUserByEmail(email: string): Promise<UserType> {
    return (
      await this.userModel.findOne({ email }).populate("entrypoints")
    )?.toObject();
  }

  public async findUserByEntryPoint(id: string): Promise<UserType> {
    return this.userModel.findOne({ entrypoints: id });
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return Boolean(user);
  }
}
