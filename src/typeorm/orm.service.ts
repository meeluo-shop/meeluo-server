import { Service, Repository } from '@jiaxinjiang/nest-orm';

export class OrmService<T> extends Service<T> {
  constructor(repostory: Repository<T>) {
    super(repostory);
  }
}
