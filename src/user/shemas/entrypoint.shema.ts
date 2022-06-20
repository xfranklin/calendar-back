import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { EntrypointEnum } from "../types/entrypoints.enum";

@Schema({ versionKey: false })
export class Entrypoint {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  type: EntrypointEnum;

  @Prop()
  clientId: string;
}

export type EntrypointDocument = Entrypoint & Document;

export const EntrypointSchema = SchemaFactory.createForClass(Entrypoint);
