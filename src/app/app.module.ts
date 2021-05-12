import { ConfigModule } from '@jiaxinjiang/nest-config';
import { HttpExceptionFilter } from '@jiaxinjiang/nest-exception';
import { LoggerModule } from '@jiaxinjiang/nest-logger';
import { Module } from '@nestjs/common';
import { MEELUO_SHOP_DATABASE, VHosts } from '@core/constant';
import { LoggerMiddleware } from '@core/middleware';
import { SnakeToHumpPipe, ValidationPipe } from '@core/pipe';
import { TransformInterceptor } from '@core/interceptor';
import { WechatModule } from '@shared/wechat';
import { OrmPackingModule } from '@shared/orm';
import { CachePackingModule } from '@shared/cache';
import { AmqpPackingModule } from '@shared/amqp';
import { HttpPackingModule } from '@shared/http';
import { JwtPackingModule } from '@shared/jwt';
import { QiniuPackingModule } from '@shared/qiniu';
import { YiLianPackingModule } from '@shared/yilian';
import { CommonModule } from '@app/common';
import { AdminModule } from '@app/admin';
import { AgentModule } from '@app/agent';
import { MerchantModule } from '@app/merchant';
import { ClientModule } from '@app/client';
import { ConsumerModule } from '@app/consumer';

@Module({
  imports: [
    // global modules
    ConfigModule,
    WechatModule,
    LoggerModule.forRoot(),
    AmqpPackingModule.forRootAsync(VHosts.MEELUO_SHOP),
    OrmPackingModule.forRootAsync(MEELUO_SHOP_DATABASE),
    JwtPackingModule.forRootAsync(),
    QiniuPackingModule.forRootAsync(),
    HttpPackingModule.forRootAsync(),
    CachePackingModule.forRootAsync(),
    YiLianPackingModule.forRootAsync(),
    // app modules
    CommonModule,
    AdminModule,
    AgentModule,
    MerchantModule,
    ClientModule,
    ConsumerModule,
  ],
  providers: [
    LoggerMiddleware,
    ValidationPipe,
    SnakeToHumpPipe,
    TransformInterceptor,
    HttpExceptionFilter,
  ],
})
export class AppModule {}
