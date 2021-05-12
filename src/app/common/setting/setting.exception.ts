import { ApiException } from '@jiaxinjiang/nest-exception';

export class CommonSettingInvalidKeyException extends ApiException {
  readonly code: number = 904001;
  readonly msg: string = '无效的配置项';
}
