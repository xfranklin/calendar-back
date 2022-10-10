import { Entity, Index, Property } from "@mikro-orm/core";
import { BaseEntity } from "../../entities/base.entity";
import { RefreshRepository } from "../refresh.repository";

@Entity({ customRepository: () => RefreshRepository })
export class Refresh extends BaseEntity {
  @Property()
  userId: string;

  @Property()
  refreshToken: string;

  @Property()
  createdAt: Date = new Date();

  @Property()
  @Index({ options: { expireAfterSeconds: 0 } })
  expiredAt: Date = new Date();
}
