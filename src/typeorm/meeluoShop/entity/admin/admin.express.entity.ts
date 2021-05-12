import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { Column, Entity, Scope } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';

@Scope<AdminExpressEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_express', { database: MEELUO_SHOP_DATABASE })
export class AdminExpressEntity extends BaseEntity {
  @Column('varchar', { length: 255, comment: '物流公司名称' })
  name: string;

  @Column('varchar', { length: 255, comment: '物流公司代码' })
  code: string;

  @Column('int', {
    comment: '排序',
    unsigned: true,
    nullable: true,
    default: 1,
  })
  order: number;
}
