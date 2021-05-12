import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientGetPointsSettingFailedException extends ApiException {
  readonly code: number = 407001;
  readonly msg: string = '获取积分设置失败';
}
