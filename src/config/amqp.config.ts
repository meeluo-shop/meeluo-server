import { Options } from 'amqplib';
import { ExchangeOptions, QueueOptions } from '@jiaxinjiang/nest-amqp';
import { UtilHelperProvider } from '@shared/helper';
import { VHosts, Exchanges, Queues, Routers } from '@core/constant';

const { AMQP_HOST, AMQP_PORT, AMQP_USER, AMQP_PASSWORD } = process.env;

export default {
  [VHosts.MEELUO_SHOP]: {
    connection: {
      protocol: 'amqp',
      hostname: AMQP_HOST,
      port: AMQP_PORT,
      username: AMQP_USER,
      password: AMQP_PASSWORD,
      locale: 'en_US',
      frameMax: 0,
      heartbeat: 0,
      vhost: 'meeluo_shop',
    } as Options.Connect,
    exchanges: [
      {
        exchange: Exchanges.ORDER_DELAY, // 商品订单定时任务交换机
        type: 'x-delayed-message',
        options: {
          durable: true,
          arguments: { 'x-delayed-type': 'direct' },
        },
        encode: UtilHelperProvider.bufferEncode,
      },
    ] as ExchangeOptions[],
    queues: [
      {
        queue: Queues.ORDER_DELAY, // 订单相关定时任务
        exchange: Exchanges.ORDER_DELAY,
        nackOptions: { requeue: false },
        decode: UtilHelperProvider.bufferDecode,
        patterns: Routers.ORDER_DELAY,
      },
    ] as QueueOptions[],
  },
};
