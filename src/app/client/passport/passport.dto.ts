import { ApiProperty } from '@shared/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import {
  MerchantStaffEntity,
  MerchantUserEntity,
  WechatAppTypeEnum,
  WechatUserSubscribeEnum,
} from '@typeorm/meeluoShop';
import { ClientMerchantInfoRespDTO } from '../merchant/merchant.dto';
import { Type } from 'class-transformer';
import { WechatAuthSnsApiTypeEnum } from '@library/easyWechat/OfficialAccount/OAuth/OAuthClient';
import { IsEnum } from '@core/decorator';

export class ClientWechatLoginDTO {
  @ApiProperty({
    description: '微信公众号网页临时登录凭证',
  })
  @MaxLength(50)
  code: string;

  @ApiProperty({
    enum: WechatAuthSnsApiTypeEnum,
    description: '微信公众号授权类型',
  })
  @IsEnum(WechatAuthSnsApiTypeEnum)
  snsApi: WechatAuthSnsApiTypeEnum;

  @ApiProperty({
    required: false,
    description: '邀请人用户id',
  })
  @IsOptional()
  @Type(() => Number)
  inviteUserId: number;
}

export class ClientJwtPayloadDTO {
  staffId: number;
  merchantName: string;
  userId: number;
  merchantId: number;
  openid: string; // 微信公众号openid
}

export class ClientLoginRespDTO {
  token: string;
  staff: MerchantStaffEntity;
  user: MerchantUserEntity;
  merchant: ClientMerchantInfoRespDTO;
  isNewUser: 0 | 1;
}

export class WechatUserInfoDTO {
  subscribe: WechatUserSubscribeEnum;
  appId: string;
  avatar: string;
  city?: string;
  country?: string;
  province?: string;
  gender: number;
  nickname: string;
  openid: string;
  appType: WechatAppTypeEnum;
}
