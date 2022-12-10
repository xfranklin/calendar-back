import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { Entrypoint } from "./entities/entrypoint.entity";
import { EntrypointEnum } from "./types/entrypoints.enum";
import { getUser } from "./helpers/getUser";
import { MailSenderService } from "../mailsender/mail-sender.service";
import { LettersEnum } from "../mailsender/types/letters.enum";
import { UserRepository } from "./user.repository";
import { EntrypointRepository } from "./entrypoint.repository";
import * as argon2 from "argon2";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly entrypointRepository: EntrypointRepository,
    private readonly mailSenderService: MailSenderService
  ) {}

  // TODO DElETE ME
  public async testSend() {
    return await this.mailSenderService.sendMail(
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

  // ┌─┐┌┐┌┌┬┐┬─┐┬ ┬┌─┐┌─┐┬┌┐┌┌┬┐┌─┐
  // ├┤ │││ │ ├┬┘└┬┘├─┘│ │││││ │ └─┐
  // └─┘┘└┘ ┴ ┴└─ ┴ ┴  └─┘┴┘└┘ ┴ └─┘
  public async entrypoints(id: string): Promise<ReturnType<any>> {
    const entrypoints = await this.entrypointRepository.find({ user: id });
    return entrypoints.map(({ id, type }) => ({
      id,
      type
    }));
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

  // ┌─┐┬ ┬┌─┐┌┐┌┌─┐┌─┐  ┌─┐┌─┐┌─┐┌─┐┬ ┬┌─┐┬─┐┌┬┐
  // │  ├─┤├─┤││││ ┬├┤   ├─┘├─┤└─┐└─┐││││ │├┬┘ ││
  // └─┘┴ ┴┴ ┴┘└┘└─┘└─┘  ┴  ┴ ┴└─┘└─┘└┴┘└─┘┴└──┴┘
  public async changePassword(id: string, passwordData) {
    const user = await this.findUserById(id);
    const emailEntrypoint = user.entrypoints
      .getItems()
      .find(({ type }) => type === EntrypointEnum.EMAIL);
    if (!emailEntrypoint) {
      throw new HttpException(
        "DO_NOT_HAVE_EMAIL_ENTRYPOINT",
        HttpStatus.BAD_REQUEST
      );
    }
    if (!user.isVerified) {
      throw new HttpException("NOT_VERIFIED_USER", HttpStatus.BAD_REQUEST);
    }
    if (
      !(await argon2.verify(emailEntrypoint.password, passwordData.oldPassword))
    ) {
      throw new HttpException("WRONG_OLD_PASSWORD", HttpStatus.BAD_REQUEST);
    }
    const password = await argon2.hash(passwordData.newPassword);
    const updatedPassword = await this.updatePasswordByEntryPointId(
      emailEntrypoint.id,
      password
    );
    if (updatedPassword.id) {
      return {
        status: 200
      };
    }
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************
  public async createEntrypoint(
    userId: string,
    data: Partial<Entrypoint>,
    type: EntrypointEnum
  ): Promise<Entrypoint> {
    const entrypoint = this.entrypointRepository.create({
      ...data,
      type,
      user: userId
    });
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
    return (
      await this.entrypointRepository.findOne({ id }, { populate: ["user"] })
    )?.user;
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email }, { fields: [] });
    return user !== null;
  }

  public async updatePasswordByEntryPointId(id: string, password: string) {
    const entity = await this.entrypointRepository.findOne({ id });
    if (entity) {
      entity.password = password;
      await this.entrypointRepository.persistAndFlush(entity);
    }
    return entity;
  }
}
