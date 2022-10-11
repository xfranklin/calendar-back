import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as sgMail from "@sendgrid/mail";
import { LettersEnum } from "./types/letters.enum";
import { ConfigService } from "@nestjs/config";
import { MailLimitsRepository } from "./mail-limits.repository";
import type { MailDataRequired } from "@sendgrid/helpers/classes/mail";

const LETTERS_LIMIT = 5;

@Injectable()
export class MailSenderService {
  constructor(
    private readonly mailLimitsRepository: MailLimitsRepository,
    private readonly configService: ConfigService
  ) {}

  // ┌─┐┌─┐┌┐┌┌┬┐  ┌─┐┌┬┐┬┌─┐┬
  // └─┐├┤ │││ ││  ├┤ ││││├─┤│
  // └─┘└─┘┘└┘─┴┘  └─┘┴ ┴┴┴ ┴┴─┘
  public async sendMail(
    userEmail: string,
    letterId: LettersEnum,
    data: Record<string, string>
  ) {
    const limit = await this.getLimit(userEmail, letterId);
    if (limit) {
      if (limit.counter < LETTERS_LIMIT) {
        limit.counter = limit.counter + 1;
        limit.expiredAt = new Date().toISOString() as unknown as Date;
        await this.mailLimitsRepository.persist(limit);
        await this.send(userEmail, letterId, data);
      } else {
        const MONGO_TTL_THRESHOLD = 60;
        const secondPassed: number =
          (Date.now() - Date.parse(limit.expiredAt as unknown as string)) /
          1000;
        const secondsLeft = MONGO_TTL_THRESHOLD + 70 - secondPassed;
        return { secondsLeft };
      }
    } else {
      await this.createLimit(userEmail, letterId);
      await this.send(userEmail, letterId, data);
    }
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************

  private async createLimit(userEmail: string, letterId: string) {
    const limit = this.mailLimitsRepository.create({
      userEmail,
      letterId
    });

    await this.mailLimitsRepository.persistAndFlush(limit);
    return limit;
  }

  private async getLimit(userEmail: string, letterId: string) {
    return await this.mailLimitsRepository.findOne({ userEmail, letterId });
  }

  private async send(
    userEmail: string,
    letterId: LettersEnum,
    data: Record<string, string>
  ) {
    const FROM = "notify@oooi.app";
    sgMail.setApiKey(this.configService.get<string>("SENDGRID_API_KEY"));
    const message: MailDataRequired = {
      from: {
        email: FROM
        // TODO add name
      },
      templateId: letterId,
      personalizations: [
        {
          to: [{ email: userEmail }],
          dynamicTemplateData: data
        }
      ]
    };
    try {
      await sgMail.send(message);
    } catch (e) {
      throw new HttpException(
        "SEND_MAIL_SERVER_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
