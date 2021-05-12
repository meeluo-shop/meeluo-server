import { Inject, Injectable } from '@nestjs/common';
import { Consume } from '@jiaxinjiang/nest-amqp';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { Queues } from '@core/constant';
import { Case, switchHandler } from '@shared/helper';
import { Message, OrderMessage, OrderMessageTypeEnum } from './order.dto';
import { ClientMenuService } from '@app/client/menu';
import { ClientOrderService } from '@app/client/order';
import { MerchantWinningService } from '@app/merchant/winning';
import { MerchantMenuOrderService } from '@app/merchant/menu/order';
import { BaseService } from '@app/app.service';
import {
  MerchantMenuOrderEntity,
  MerchantOrderEntity,
} from '@typeorm/meeluoShop';

@Injectable()
export class OrderConsumer extends BaseService {
  constructor(
    @InjectLogger(OrderConsumer) private logger: LoggerProvider,
    @Inject(ClientMenuService)
    private menuService: ClientMenuService,
    @Inject(ClientOrderService)
    private orderService: ClientOrderService,
    @Inject(MerchantWinningService)
    private winningService: MerchantWinningService,
    @Inject(MerchantMenuOrderService)
    private menuOrderService: MerchantMenuOrderService,
  ) {
    super();
  }

  @Consume(Queues.ORDER_DELAY)
  async delayConsume(message: Message<OrderMessage, OrderMessageTypeEnum>) {
    this.logger.info(`AMQP order Message: ${JSON.stringify(message)}`);
    await switchHandler(this, message.type)(message.data);
  }

  /**
   * 定期自动确认未收货的订单
   */
  @Case(OrderMessageTypeEnum.AUTO_RECEIPT_ORDER)
  async handleReceiptOrder({ orderId, userId, merchantId }: OrderMessage) {
    await this.orderService.receipt(orderId, userId, merchantId);
  }

  /**
   * 定期自动取消未付款的订单
   * @param message
   */
  @Case(OrderMessageTypeEnum.AUTO_CANCEL_NOT_PAY_ORDER)
  async handleNotPayOrder({ orderId }: OrderMessage) {
    const order = this.generateEntity(orderId, MerchantOrderEntity);
    await this.orderService.cancelNotPayOrder(order);
  }

  /**
   * 定期自动确认未收货的奖品订单
   * @param param0
   */
  @Case(OrderMessageTypeEnum.AUTO_RECEIPT_WINNING)
  async handleReceiptWinning({ orderId }: OrderMessage) {
    await this.winningService.confirmReceipt(orderId);
  }

  /**
   * 把未领奖和未确认的订单设置为已过期
   */
  @Case(OrderMessageTypeEnum.AUTO_EXPIRE_WINNING)
  async handleNotReceiveWinning({ orderId, userId, merchantId }: OrderMessage) {
    await this.winningService.winningExpire(orderId, userId, merchantId);
  }

  /**
   * 定期自动取消未付款的点餐订单
   */
  @Case(OrderMessageTypeEnum.AUTO_CANCEL_NOT_PAY_MENU_ORDER)
  async handleNotPayMenuOrder({ orderId }: OrderMessage) {
    const order = this.generateEntity(orderId, MerchantMenuOrderEntity);
    await this.menuService.cancelNotPayOrder(order);
  }

  /**
   * 定期自动完成已付款或餐后付款的订单
   */
  @Case(OrderMessageTypeEnum.AUTO_COMPLETE_MENU_ORDER)
  async handleNotFinishMenuOrder({
    orderId,
    userId,
    merchantId,
  }: OrderMessage) {
    await this.menuOrderService.complete(orderId, userId, merchantId);
  }
}
