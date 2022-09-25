import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import { LettersEnum } from "./types/letters.enum";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MailLimits, MailLimitsDocument } from "./shemas/mail-limits.schema";

const LETTERS_LIMIT = 5;

@Injectable()
export class MailSenderService {
  constructor(
    @InjectModel(MailLimits.name)
    private readonly mailLimits: Model<MailLimitsDocument>,
    private readonly configService: ConfigService
  ) {}

  // ┌─┐┌─┐┌┐┌┌┬┐  ┌─┐┌┬┐┬┌─┐┬
  // └─┐├┤ │││ ││  ├┤ ││││├─┤│
  // └─┘└─┘┘└┘─┴┘  └─┘┴ ┴┴┴ ┴┴─┘
  public async sendMail(userEmail: string, letterId: LettersEnum, data: any) {
    const limit = await this.getLimit(userEmail, letterId);
    if (limit) {
      if (limit.counter < LETTERS_LIMIT) {
        limit.counter = limit.counter + 1;
        limit.expiredAt = new Date().toISOString() as unknown as Date;
        await limit.save();
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
    await this.mailLimits.create({
      userEmail,
      letterId
    });
  }

  private async getLimit(userEmail: string, letterId: string) {
    return this.mailLimits.findOne({ userEmail, letterId });
  }

  private async send(userEmail: string, letterId: LettersEnum, data: any) {
    const from = this.configService.get<string>("SENDGRID_FROM");
    sgMail.setApiKey(this.configService.get<string>("SENDGRID_API_KEY"));
    const message = {
      from: {
        email: from
      },
      template_id: letterId,
      personalizations: [
        {
          to: [{ email: userEmail }],
          dynamic_template_data: data
        }
      ]
    };
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await sgMail.send(message);
    } catch (e) {
      throw new HttpException(
        "SEND_MAIL_SERVER_ERROR",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
