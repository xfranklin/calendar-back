import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class PasswordNewDto {
  @MinLength(4, { message: "SHORT_PASSWORD" })
  @MaxLength(128, { message: "LONG_PASSWORD" })
  @Matches(/^[A-Za-z0-9~`!@#$%^&*()_\-+={[}\]|:;"'<,>.?\/]*$/, {
    message: "PASSWORD_UNSUSPECTED_CHARACTERS"
  })
  @IsNotEmpty({ message: "PASSWORD_EMPTY" })
  password: string;
}
