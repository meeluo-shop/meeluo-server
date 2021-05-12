import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { MerchantEntity } from '@typeorm/meeluoShop';

export class ClientMerchantIdDTO {
  @ApiProperty({
    description: '商户id',
  })
  @Type(() => Number)
  @IsInt({ message: '商户id必须为数字类型' })
  id: number;
}

export class ClientMerchantInfoRespDTO extends MerchantEntity {
  @ApiProperty({
    description: '微信公众号appid',
  })
  appId: string;

  @ApiProperty({
    description: '微信公众号账号id',
  })
  wechatId: string;
}
