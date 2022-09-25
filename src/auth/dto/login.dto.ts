import { IsNotEmpty } from "class-validator";
import { SignUpDto } from "./signup.dto";

export class LoginDto extends SignUpDto {
  @IsNotEmpty({ message: "PASSWORD_EMPTY" })
  password: string;
}
