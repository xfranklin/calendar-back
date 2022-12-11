import { IsNotEmpty, MaxLength, IsISO8601 } from "class-validator";

export class PersonalInfoDto {
  @IsNotEmpty({ message: "EMPTY_FIELD" })
  @MaxLength(128, { message: "MAX_LENGTH" })
  firstName: string;

  @IsNotEmpty({ message: "EMPTY_FIELD" })
  @MaxLength(128, { message: "MAX_LENGTH" })
  lastName: string;

  @IsNotEmpty({ message: "EMPTY_FIELD" })
  @IsISO8601({ strict: false }, { message: "NOT_DATE_FORMAT" })
  birthday: string;
}
