import { EntityRepository, FilterQuery, wrap } from "@mikro-orm/core";
import { User } from "./entities/user.entity";

export class UserRepository extends EntityRepository<User> {
  public async findAndUpdate(
    filter: FilterQuery<User>,
    data: Partial<User>
  ): Promise<User> {
    const user = await this.findOneOrFail(filter);
    const updatedUser = wrap(user).assign(data);
    await this.flush();
    return updatedUser;
  }
}
