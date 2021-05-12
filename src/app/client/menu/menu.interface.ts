import { MerchantGoodsEntity } from '@typeorm/meeluoShop';

export interface ClientMenuOrderGoodsInfo extends MerchantGoodsEntity {
  goodsNum: number;
  // 商品选中规格详细内容
  specs: string;
  // 会员等级抵扣比例
  gradeRatio?: number;
  // 会员折扣的商品单价
  gradeGoodsPrice?: number;
  // 会员折扣的商品总价
  gradeTotalMoney?: number;
  // 实际抵扣的积分数量
  pointsNum?: number;
  // 积分实际抵扣的金额
  pointsMoney?: number;
  // 商品折扣（包含折扣，不包含优惠）后的总金额
  totalPrice?: number;
  // 商品最终结算（包含折扣和优惠）总金额
  totalPayPrice?: number;
  // 赠送的积分数量
  pointsBonus?: number;
  // 价格权重占比
  weight?: number;
  // 优惠券抵扣金额
  couponMoney?: number;
}
