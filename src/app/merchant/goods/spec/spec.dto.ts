import { ApiProperty } from '@shared/swagger';
import { MaxLength } from 'class-validator';

export class AddMerchantGoodsSpecDTO {
  @ApiProperty({
    description: '产品规格名称',
  })
  @MaxLength(50, { message: '产品规格名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '产品规格值',
  })
  @MaxLength(100, { message: '产品规格值长度不能超过100' })
  value: string;
}

export class AddMerchantGoodsSpecRespDTO {
  specId: number;
  specValueId: number;

  constructor(specId?: number, specValueId?: number) {
    specId && (this.specId = specId);
    specValueId && (this.specValueId = specValueId);
  }
}
