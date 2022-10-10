import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { Entrypoint } from "./entities/entrypoint.entity";
import { EntrypointEnum } from "./types/entrypoints.enum";
import { getUser } from "./helpers/getUser";
import { MailSenderService } from "../mailsender/mail-sender.service";
import { LettersEnum } from "../mailsender/types/letters.enum";
import { UserRepository } from "./user.repository";
import { EntrypointRepository } from "./entrypoint.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly entrypointRepository: EntrypointRepository,
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
  public async me(id: string): Promise<ReturnType<typeof getUser>> {
    const user = await this.userRepository.findOneOrFail(id);
    return getUser(user);
  }

  // ┌─┐┌┐┌┌┐ ┌─┐┌─┐┬─┐┌┬┐┬┌┐┌┌─┐
  // │ ││││├┴┐│ │├─┤├┬┘ │││││││ ┬
  // └─┘┘└┘└─┘└─┘┴ ┴┴└──┴┘┴┘└┘└─┘
  public async onboard(id: string, personalInfo) {
    const birthday = new Date(personalInfo.birthday);

    const user = await this.userRepository.findAndUpdate(id, {
      ...personalInfo,
      birthday,
      isOnboarded: true
    });

    // TO DO SEND CONFIRM EMAIL
    return { user: getUser(user) };
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************
  public async createEntrypoint(
    type: EntrypointEnum,
    data: Partial<Entrypoint>
  ): Promise<Entrypoint> {
    const entrypoint = this.entrypointRepository.create({ type, ...data });
    await this.entrypointRepository.persistAndFlush(entrypoint);
    return entrypoint;
  }

  public async findEntrypointByClientId(
    type: EntrypointEnum,
    id: string
  ): Promise<Entrypoint> {
    return this.entrypointRepository.findOne({ type, clientId: id });
  }

  public async create(
    user: Partial<User>,
    entrypoint: Partial<Entrypoint>
  ): Promise<User> {
    const newUser = this.userRepository.create({
      ...user,
      entrypoints: [entrypoint]
    });
    await this.userRepository.persistAndFlush(newUser);
    return newUser;
  }

  public async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne(
      { email },
      { populate: ["entrypoints"] }
    );
  }

  public async findUserById(id: string): Promise<User> {
    return await this.userRepository.findOne(id, { populate: ["entrypoints"] });
  }

  public async updateUserByEmail(
    email: string,
    data: Partial<User>
  ): Promise<User> {
    return await this.userRepository.findAndUpdate({ email }, data);
  }

  public async findUserByEntryPoint(id: string): Promise<User> {
    return this.userRepository.findOne({ entrypoints: id });
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email }, { fields: [] });
    return user !== null;
  }
}
