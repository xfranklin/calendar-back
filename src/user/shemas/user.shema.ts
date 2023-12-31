import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RoleEnum } from "../types/roles.enum";
import { Entrypoint } from "./entrypoint.shema";

@Schema({ versionKey: false })
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop({ default: RoleEnum.USER })
  role: RoleEnum;

  @Prop({ type: [Types.ObjectId], ref: Entrypoint.name })
  entrypoints: Types.ObjectId[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isOnboarded: boolean;

  @Prop({ default: "" })
  firstName: string;

  @Prop({ default: "" })
  lastName: string;

  @Prop({ default: null })
  birthday: Date;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
