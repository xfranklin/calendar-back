import { IsNotEmpty, MaxLength, MinLength, Matches } from "class-validator";

export class ChangePasswordDto {
  @MinLength(4, { message: "SHORT_PASSWORD" })
  @MaxLength(128, { message: "LONG_PASSWORD" })
  @Matches(/^[A-Za-z0-9~`!@#$%^&*()_\-+={[}\]|:;"'<,>.?\/]*$/, {
    message: "PASSWORD_UNSUSPECTED_CHARACTERS"
  })
  @IsNotEmpty({ message: "PASSWORD_EMPTY" })
  oldPassword: string;

  @MinLength(4, { message: "SHORT_NEW_PASSWORD" })
  @MaxLength(128, { message: "LONG_NEW_PASSWORD" })
  @Matches(/^[A-Za-z0-9~`!@#$%^&*()_\-+={[}\]|:;"'<,>.?\/]*$/, {
    message: "NEW_PASSWORD_UNSUSPECTED_CHARACTERS"
  })
  @IsNotEmpty({ message: "NEW_PASSWORD_EMPTY" })
  newPassword: string;
}
