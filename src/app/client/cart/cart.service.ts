import { BaseService } from '@app/app.service';
import { FindConditions, InjectService } from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantGoodsSkuEntity,
  MerchantUserCartEntity,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { ResourceService } from '@app/common/resource';
import { ClientCartAddDTO, ClientCartDeleteDTO } from './cart.dto';
import { ClientGoodsService } from '../goods';
import { MerchantGoodsSpecService } from '@app/merchant/goods';

@Injectable()
export class ClientCartService extends BaseService {
  constructor(
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(ClientGoodsService)
    private goodsService: ClientGoodsService,
    @Inject(MerchantGoodsSpecService)
    private specService: MerchantGoodsSpecService,
    @InjectService(MerchantUserCartEntity)
    private cartService: OrmService<MerchantUserCartEntity>,
  ) {
    super();
  }

  /**
   * 购物车添加商品
   * @param body
   * @param param1
   */
  async add(body: ClientCartAddDTO, identity: ClientIdentity) {
    const { merchantId, userId } = identity;
    const { goodsId, specSkuId, goodsNum } = body;
    const condition: FindConditions<MerchantUserCartEntity> = {
      merchantId,
      merchantUserId: userId,
      goodsId,
      specSkuId,
    };
    // 查询购物车是否存在该商品
    const cart = await this.cartService.findOne({
      select: ['goodsNum'],
      where: {
        ...condition,
      },
    });
    if (cart) {
      // 如果购物车里存在该商品，增加商品数量
      await this.cartService.update(
        {
          goodsNum: cart.goodsNum + goodsNum,
        },
        {
          ...condition,
        },
        userId,
      );
    } else {
      // 如果不存在，则新增商品
      await this.cartService.create(
        {
          merchantId,
          merchantUserId: userId,
          ...body,
        },
        userId,
      );
    }
    return this.count(identity);
  }

  /**
   * 删除购物车商品
   * @param body
   * @param param1
   */
  async delete(
    body: ClientCartDeleteDTO,
    identity: ClientIdentity,
    returnCount = true,
  ) {
    const { merchantId, userId } = identity;
    await this.cartService.delete(
      {
        merchantId,
        merchantUserId: userId,
        ...body,
      },
      userId,
    );
    return returnCount ? this.count(identity) : 0;
  }

  /**
   * 减少购物车商品数量
   * @param body
   * @param param1
   */
  async decr(body: ClientCartDeleteDTO, identity: ClientIdentity) {
    const { merchantId, userId } = identity;
    const { goodsId, specSkuId } = body;
    const condition: FindConditions<MerchantUserCartEntity> = {
      merchantId,
      merchantUserId: userId,
      goodsId,
      specSkuId,
    };
    const cart = await this.cartService.findOne({
      select: ['goodsNum'],
      where: {
        ...condition,
      },
    });
    if (!cart) {
      return false;
    }
    if (cart.goodsNum - 1 <= 0) {
      await this.delete(body, identity);
      return true;
    }
    await this.cartService.update(
      {
        goodsNum: cart.goodsNum - 1,
      },
      {
        ...condition,
      },
      userId,
    );
    return true;
  }

  /**
   * 获取购物车里的商品列表
   * @param param0
   */
  async list({ merchantId, userId }: ClientIdentity) {
    const cartList = await this.cartService.find({
      where: {
        merchantUserId: userId,
        merchantId,
      },
    });
    const goodsIds = Array.from(new Set(cartList.map(cart => cart.goodsId)));
    const goodsResp = await this.goodsService.list(
      { pageSize: goodsIds.length },
      { ids: goodsIds },
      merchantId,
    );
    let skus: MerchantGoodsSkuEntity[] = [];
    goodsResp.rows.forEach(goods => {
      skus = skus.concat(goods.skus);
      cartList.forEach(cart => {
        if (cart.goodsId === goods.id) {
          cart.goods = goods;
        }
      });
    });
    await Promise.all([
      this.resourceService.bindTargetResource(skus, 'image', 'imageId'),
    ]);
    return cartList;
  }

  /**
   * 获取购物车商品数量
   * @param param0
   */
  async count({ merchantId, userId }: ClientIdentity) {
    return this.cartService.count({
      merchantUserId: userId,
      merchantId,
    });
  }
}
