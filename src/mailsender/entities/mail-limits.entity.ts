import { Entity, Index, Property } from "@mikro-orm/core";
import { MailLimitsRepository } from "../mail-limits.repository";
import { BaseEntity } from "../../entities/base.entity";

@Entity({ customRepository: () => MailLimitsRepository })
export class MailLimits extends BaseEntity {
  @Property()
  userEmail: string;

  @Property()
  letterId: string;

  @Property({ default: 1 })
  counter = 1;

  @Property()
  @Index({ options: { expireAfterSeconds: 0 } })
  expiredAt: Date = new Date();
}
