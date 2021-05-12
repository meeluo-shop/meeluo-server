import { conf, rs } from 'qiniu';
import { FactoryProvider, Logger, LoggerService } from '@nestjs/common';

export interface QiniuOption {
  accessKey: string;
  secretKey: string;
  bucket: string;
  domain: string;
  logger?: Logger | LoggerService;
  config?: conf.ConfigOptions;
  putPolicy: rs.PutPolicyOptions;
}

export interface QiniuAsyncOption {
  name?: string;
  useFactory: (...args: any[]) => Promise<QiniuOption[]> | QiniuOption[];
  inject?: FactoryProvider['inject'];
}
