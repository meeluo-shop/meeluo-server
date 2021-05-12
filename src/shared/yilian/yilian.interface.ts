import { FactoryProvider, Logger, LoggerService } from '@nestjs/common';

export interface ConfigOptions {
  cid: string;
  secret: string;
  logger?: Logger | LoggerService;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface AsyncConfigOptions {
  name?: string;
  useFactory: (...args: any[]) => Promise<ConfigOptions> | ConfigOptions;
  inject?: FactoryProvider['inject'];
}
