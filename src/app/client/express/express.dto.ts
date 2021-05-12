import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
} from 'class-validator';

export class Kuaidi100SyncQueryData {
  context: string; // 内容
  time: string; //	时间，原始格式
  ftime: string; //	格式化后时间
  status?: string; //	本数据元对应的签收状态，只有实时查询接口中提交resultv2标记后才会出现
  areaCode?: string; // 本数据元对应的行政区域的编码，只有实时查询接口中提交resultv2标记后才会出现
  areaName?: string; // 本数据元对应的行政区域的名称，只有实时查询接口中提交resultv2标记后才会出现
}

export class Kuaidi100SyncQueryResp {
  message?: string;
  nu?: string;
  com?: string;
  ischeck?: 0 | 1;
  condition?: string;
  status?: number;
  data?: Kuaidi100SyncQueryData[];
  result?: boolean;
  returnCode?: number;
}

export class ClientExpressQueryNoRespDTO extends Kuaidi100SyncQueryResp {
  expressCompany?: string;
  expressNo?: string;
  expressCode?: string;
}

export enum ClientExpressQueryNoTypeEnum {
  WINNING = 10, // 游戏获奖订单物流单号
  ORDER = 20, // 商品订单物流单号
}

export class ClientExpressQueryNoDTO {
  @ApiProperty({
    description: '物流订单id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的物流订单id' })
  expressId: number;

  @ApiProperty({
    enum: ClientExpressQueryNoTypeEnum,
    description: '物流订单类型，10 游戏获奖订单，20 商品订单',
  })
  @Type(() => Number)
  @IsEnum(ClientExpressQueryNoTypeEnum)
  type: ClientExpressQueryNoTypeEnum;
}
