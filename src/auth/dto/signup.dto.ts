import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class SignUpDto {
  @IsEmail({}, { message: "INVALID_EMAIL" })
  @IsNotEmpty({ message: "EMAIL_EMPTY" })
  email: string;

  @MinLength(4, { message: "SHORT_PASSWORD" })
  @MaxLength(128, { message: "LONG_PASSWORD" })
  @Matches(/^[A-Za-z0-9~`!@#$%^&*()_\-+={[}\]|:;"'<,>.?\/]*$/, {
    message: "PASSWORD_UNSUSPECTED_CHARACTERS",
  })
  @IsNotEmpty({ message: "PASSWORD_EMPTY" })
  password: string;
}
