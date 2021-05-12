import { Injectable } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import { MerchantGamePrizeEntity } from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { MerchantGamePrizeListParamsDTO } from './prize.dto';

@Injectable()
export class MerchantGamePrizeService extends BaseService {
  constructor(
    @InjectService(MerchantGamePrizeEntity)
    private prizeEntityService: OrmService<MerchantGamePrizeEntity>,
  ) {
    super();
  }

  /**
   * 获取商户下的奖品id列表（不包含奖品详情）
   * @param param0
   * @param param1
   */
  async getPrizeList(
    { pageIndex, pageSize, type, gameId }: MerchantGamePrizeListParamsDTO,
    merchantId: number,
  ) {
    return this.prizeEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        type,
        adminGameId: gameId,
        merchantId,
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
