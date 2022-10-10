import { EntityRepository } from "@mikro-orm/core";
import { MailLimits } from "./entities/mail-limits.entity";

export class MailLimitsRepository extends EntityRepository<MailLimits> {}
