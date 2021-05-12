import { Type } from 'class-transformer';
import { MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { IsEnum } from '@core/decorator';
import { AgentUserEntity } from '@typeorm/meeluoShop';

export enum IsEncryptEnum {
  TRUE = 1,
  FALSE = 0,
}

export class AgentLoginDTO {
  @ApiProperty({
    description: '手机号或邮箱',
  })
  @MinLength(4, { message: '账户长度不能少于4' })
  @MaxLength(50, { message: '账户长度不能超过50' })
  account: string;

  @ApiProperty({
    description: '密码',
  })
  @MinLength(5, { message: '密码长度不能少于5位' })
  @MaxLength(30, { message: '密码长度不能大于30位' })
  password: string;

  @ApiProperty({
    enum: IsEncryptEnum,
    description: '是否使用加密方式登陆',
  })
  @Type(() => Number)
  @IsEnum(IsEncryptEnum, { message: '无效的登陆方式' })
  encrypt: IsEncryptEnum = IsEncryptEnum.TRUE;
}

export class AgentLoginSuccessDTO {
  agentId: number;
  userId: number;
  token: string;
  user: AgentUserEntity;
}
