import { EntityRepository } from "@mikro-orm/core";
import { Refresh } from "./entities/refresh.entity";

export class RefreshRepository extends EntityRepository<Refresh> {}
