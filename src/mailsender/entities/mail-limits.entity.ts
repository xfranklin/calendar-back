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
  counter: number;

  @Property()
  @Index({ options: { expireAfterSeconds: 70 } })
  expiredAt: Date = new Date();
}
