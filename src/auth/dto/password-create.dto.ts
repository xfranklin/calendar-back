import { IsNotEmpty } from "class-validator";
import { PasswordNewDto } from "./password-new.dto";
import { IsBase64 } from "../../validators/base64.validator";

export class PasswordCreateDto extends PasswordNewDto {
  @IsBase64({ urlSafe: true }, { message: "INVALID_TOKEN" })
  @IsNotEmpty({ message: "TOKEN_EMPTY" })
  token: string;
}
