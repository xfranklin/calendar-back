import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import { BaseEntity } from "../../entities/base.entity";
import { EntrypointRepository } from "../entrypoint.repository";
import { EntrypointEnum } from "../types/entrypoints.enum";

@Entity({ customRepository: () => EntrypointRepository })
export class Entrypoint extends BaseEntity {
  @Property({ default: null, nullable: true })
  email?: string;

  @Property({ default: null, nullable: true })
  password?: string;

  @Enum(() => EntrypointEnum)
  type!: EntrypointEnum;

  @Property({ default: null, nullable: true })
  clientId?: string;

  @Property()
  lastLogin: Date = new Date();

  @ManyToOne(() => User)
  user!: User;
}
