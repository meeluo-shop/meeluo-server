import { BaseService } from '@app/app.service';
import { MerchantUserGradeService } from '@app/merchant/user';
import { Inject, Injectable } from '@nestjs/common';
import { ClientUserGradeListDTO } from './grade.dto';

@Injectable()
export class ClientUserGradeService extends BaseService {
  constructor(
    @Inject(MerchantUserGradeService)
    private merchantGradeService: MerchantUserGradeService,
  ) {
    super();
  }

  /**
   * 获取用户会员等级列表
   * @param query
   * @param merchantId
   * @returns
   */
  async list(query: ClientUserGradeListDTO, merchantId: number) {
    return this.merchantGradeService.list(query, merchantId);
  }
}
