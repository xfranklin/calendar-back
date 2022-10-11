import { RoleEnum } from "../types/roles.enum";
import { Entrypoint } from "./entrypoint.entity";
import { Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";
import { UserRepository } from "../user.repository";
import { BaseEntity } from "../../entities/base.entity";

@Entity({ customRepository: () => UserRepository })
export class User extends BaseEntity {
  @Property({ default: null, nullable: true })
  email?: string;

  @Enum(() => RoleEnum)
  role: RoleEnum = RoleEnum.USER;

  @OneToMany(() => Entrypoint, (entrypoint) => entrypoint.user)
  entrypoints: Collection<Entrypoint> = new Collection<Entrypoint>(this);

  @Property({ default: false })
  isVerified!: boolean;

  @Property({ default: false })
  isOnboarded!: boolean;

  @Property({ default: null, nullable: true })
  firstName?: string;

  @Property({ default: null, nullable: true })
  lastName?: string;

  @Property({ default: null, nullable: true })
  birthday!: Date;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ default: false })
  isBlocked: boolean;
}
