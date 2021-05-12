import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Scope,
} from '@jiaxinjiang/nest-orm';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGameWinningEntity } from './merchant.game.winning.entity';
import { MerchantUserEntity } from './merchant.user.entity';

@Scope<MerchantGameWinningAddressEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_winning_address', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameWinningAddressEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  winningId: number;

  @Column('varchar', { comment: '收货人姓名', length: 50, nullable: true })
  name: string;

  @Column('varchar', { comment: '收货人手机号', length: 50, nullable: true })
  phone: string;

  @Column('int', { comment: '省份编号', unsigned: true, nullable: true })
  provinceCode: number;

  @Column('int', { comment: '城市编号', unsigned: true, nullable: true })
  cityCode: number;

  @Column('int', { comment: '县市区编号', unsigned: true, nullable: true })
  countyCode: number;

  @Column('varchar', {
    comment: '详细地址',
    length: 500,
    nullable: true,
  })
  address: string;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantGameWinningEntity)
  @JoinColumn({ name: 'winning_id', referencedColumnName: 'id' })
  winning?: MerchantGameWinningEntity;

  provinceName?: string;
  countyName?: string;
  cityName?: string;
}
