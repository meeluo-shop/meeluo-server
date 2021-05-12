import * as CryptoJS from 'crypto-js';
import { Injectable, Inject } from '@nestjs/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { InjectConfig, ConfigService } from '@jiaxinjiang/nest-config';
import { HttpFetchService } from '@shared/http';
import { BaseService } from '@app/app.service';
import { Kuaidi100ConfigOption } from '@config/kuaidi100.config'
import { OrmService } from '@typeorm/orm.service';
import { MerchantOrderExpressEntity, MerchantGameWinningExpressEntity } from '@typeorm/meeluoShop';
import { Kuaidi100SyncQueryResp, ClientExpressQueryNoRespDTO, ClientExpressQueryNoDTO, ClientExpressQueryNoTypeEnum } from './express.dto'

@Injectable()
export class ClientExpressService extends BaseService {
  constructor(
    @InjectConfig()
    private configService: ConfigService,
    @Inject(HttpFetchService) private httpService: HttpFetchService,
    @InjectService(MerchantOrderExpressEntity)
    private orderExpressEntityService: OrmService<MerchantOrderExpressEntity>,
    @InjectService(MerchantGameWinningExpressEntity)
    private winningExpressEntityService: OrmService<
      MerchantGameWinningExpressEntity
    >,
  ) {
    super()
  }

  /**
   * 查询物流单号
   * @param param0 
   * @param param1 
   */
  async queryNo({ expressId, type }: ClientExpressQueryNoDTO, { userId }: ClientIdentity): Promise<ClientExpressQueryNoRespDTO> {
    let expressInfo: MerchantOrderExpressEntity | MerchantGameWinningExpressEntity;
    switch (type) {
      case ClientExpressQueryNoTypeEnum.ORDER:
        expressInfo = await this.orderExpressEntityService.findOne({
          where: {
            id: expressId,
            merchantUserId: userId,
          },
        });
        break;
      case ClientExpressQueryNoTypeEnum.WINNING:
        expressInfo = await this.winningExpressEntityService.findOne({
          where: {
            id: expressId,
            merchantUserId: userId,
          },
        });
        break;
    }
    if (!expressInfo) {
      return null;
    }
    const queryRet: ClientExpressQueryNoRespDTO = await this.syncQuery({ expressNo: expressInfo.expressNo, expressCode: expressInfo.expressCode });
    queryRet.expressCode = expressInfo.expressCode;
    queryRet.expressCompany = expressInfo.expressCompany;
    queryRet.expressNo = expressInfo.expressNo;
    return queryRet;
  }

  /**
   * 调用实时查询订单接口
   * @param param0 
   */
  async syncQuery({
    expressCode, expressNo,
  }: {
    expressNo: string;
    expressCode: string;
  }) {
    const kuaidi100Config: Kuaidi100ConfigOption = this.configService.get('kuaidi100')
    const param = JSON.stringify({
      com: expressCode,
      num: expressNo,
      resultv2: 1,
    });
    const signStr = param + kuaidi100Config.key + kuaidi100Config.customer;
    return this.httpService.get<Kuaidi100SyncQueryResp>(
      kuaidi100Config.apis.syncQuery,
      {
        params: {
          param,
          customer: kuaidi100Config.customer,
          sign: CryptoJS.MD5(signStr).toString().toUpperCase()
        },
      },
    );
  }
}