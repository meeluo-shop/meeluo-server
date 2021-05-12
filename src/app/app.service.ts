import { BasicService } from '@jiaxinjiang/nest-orm';
import { UtilHelperProvider } from '@shared/helper';
import { BaseEntity } from '@typeorm/base.entity';

export interface IEntity<E> {
  new (): E;
}

export class BaseService extends BasicService {
  public generateEntity<E extends BaseEntity>(
    id: number,
    entity: IEntity<E>,
  ): E;
  public generateEntity<E extends BaseEntity>(
    id: number[],
    entity: IEntity<E>,
  ): E[];
  public generateEntity<E extends BaseEntity>(
    id: number | number[],
    entity: IEntity<E>,
  ): E | E[] {
    if (Array.isArray(id)) {
      return id.map(item => {
        const instance = new entity();
        instance.id = item;
        return instance;
      });
    } else {
      const instance = new entity();
      instance.id = id;
      return instance;
    }
  }

  public clearExtraFields<T>(data: T, onlySub = false, fields: string[] = []) {
    if (!data) {
      return data;
    }
    const clearFields = <T extends BaseEntity>(data: T) => {
      delete data.version;
      delete data.isDelete;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.createdById;
      delete data.updatedById;
      fields.forEach(field => {
        delete data[field];
      });
      return data;
    };
    if (onlySub) {
      if (Array.isArray(data)) {
        for (const item of data) {
          for (const key in item) {
            if (item[key] && typeof item[key] === 'object') {
              UtilHelperProvider.deepEach(item[key], clearFields);
            }
          }
        }
      } else {
        for (const key in data) {
          if (data[key] && typeof data[key] === 'object') {
            UtilHelperProvider.deepEach(data[key], clearFields);
          }
        }
      }
    } else {
      UtilHelperProvider.deepEach(data, clearFields);
    }
    return data;
  }
}
