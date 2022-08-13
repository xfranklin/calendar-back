import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class Refresh {
  @Prop()
  userId: string;

  @Prop()
  refreshToken: string;

  // TODO set ENV
  @Prop({ type: Date, default: Date.now, index: { expireAfterSeconds: 360 } })
  expiredAt: Date;
}

export type RefreshDocument = Refresh & Document;

export const RefreshSchema = SchemaFactory.createForClass(Refresh);
