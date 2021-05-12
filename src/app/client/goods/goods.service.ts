import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import {
  MerchantGoodsService,
  MerchantGoodsCategoryService,
  MerchantGoodsCategoryListDTO,
} from '@app/merchant/goods';
import {
  ClientGoodsListDTO,
  ClientGamePrizeListParamsDTO,
  ClientGoodsIdsDTO,
  ClientGoodsPrizeListRespDTO,
} from './goods.dto';
import { MerchantGamePrizeService } from '@app/merchant/game/prize';

@Injectable()
export class ClientGoodsService extends BaseService {
  constructor(
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantGoodsCategoryService)
    private merchantGoodsCategoryService: MerchantGoodsCategoryService,
    @Inject(MerchantGamePrizeService)
    private gamePrizeService: MerchantGamePrizeService,
  ) {
    super();
  }

  /**
   * 获取游戏商品奖品列表
   * @param params
   * @param param1
   */
  async getPrizeList(
    params: ClientGamePrizeListParamsDTO,
    { merchantId }: ClientIdentity,
  ) {
    const prizeList = await this.gamePrizeService.getPrizeList(
      {
        ...params,
      },
      merchantId,
    );
    if (!prizeList.rows.length) {
      return prizeList;
    }
    const goodsIds = prizeList.rows.map(item => item.goodsId);
    const goodsListResp = await this.list(
      { pageSize: goodsIds.length },
      { ids: goodsIds },
      merchantId,
    );
    goodsListResp.rows.map((goods: ClientGoodsPrizeListRespDTO) => {
      const prize = prizeList.rows.find(prize => prize.goodsId === goods.id);
      goods.gameId = prize?.adminGameId;
      goods.prizeScore = prize?.score;
    });
    goodsListResp.count = prizeList.count;
    return goodsListResp;
  }

  /**
   * 获取商品分类列表
   * @param merchantId
   */
  async categoryList(query: MerchantGoodsCategoryListDTO, merchantId: number) {
    return this.merchantGoodsCategoryService.list(query, merchantId);
  }

  /**
   * 获取商品列表
   * @param query
   * @param body
   * @param identity
   */
  async list(
    query: ClientGoodsListDTO,
    body: ClientGoodsIdsDTO,
    merchantId: number,
  ) {
    return this.merchantGoodsService.list(query, body, merchantId);
  }

  /**
   * 获取商品详情
   * @param id
   * @param param1
   */
  async detail(id: number, { merchantId }: ClientIdentity) {
    return this.merchantGoodsService.detail(id, merchantId);
  }
}
