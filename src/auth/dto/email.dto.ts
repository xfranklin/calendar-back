import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
  @IsEmail({}, { message: "INVALID_EMAIL" })
  @IsNotEmpty({ message: "EMAIL_EMPTY" })
  email: string;
}
