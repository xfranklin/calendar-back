import { IsBase64 } from "../../validators/base64.validator";
import { IsNotEmpty } from "class-validator";

export class TokenDto {
  @IsBase64({ urlSafe: true }, { message: "INVALID_TOKEN" })
  @IsNotEmpty({ message: "TOKEN_EMPTY" })
  token: string;
}
