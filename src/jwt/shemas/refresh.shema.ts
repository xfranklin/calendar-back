import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class Refresh {
  @Prop()
  userId: string;

  @Prop()
  refreshToken: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 0 }
  })
  expiredAt: Date;
}

export type RefreshDocument = Refresh & Document;

export const RefreshSchema = SchemaFactory.createForClass(Refresh);
