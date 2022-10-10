import { PasswordNewDto } from "./password-new.dto";
import { IntersectionType } from "@nestjs/swagger";
import { EmailDto } from "./email.dto";

export class SignUpDto extends IntersectionType(EmailDto, PasswordNewDto) {}
