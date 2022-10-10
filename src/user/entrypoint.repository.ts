import { EntityRepository } from "@mikro-orm/core";
import { Entrypoint } from "./entities/entrypoint.entity";

export class EntrypointRepository extends EntityRepository<Entrypoint> {}
