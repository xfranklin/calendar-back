import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { LettersEnum } from "../types/letters.enum";

@Schema({ versionKey: false, collection: "mail-limits" })
export class MailLimits {
  @Prop()
  userEmail: string;

  @Prop()
  letterId: LettersEnum;

  @Prop({ default: 1 })
  counter: number;

  @Prop({ type: Date, default: Date.now, index: { expireAfterSeconds: 70 } })
  expiredAt: Date;
}

export type MailLimitsDocument = MailLimits & Document;

export const MailLimitsSchema = SchemaFactory.createForClass(MailLimits);
