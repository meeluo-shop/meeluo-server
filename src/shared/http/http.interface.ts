import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FactoryProvider, Logger, LoggerService } from '@nestjs/common';

export enum ParameterStyle {
  SNAKE_TO_CAMEL = 'SnakeToCamel',
  CAMEL_TO_SNAKE = 'CamelToSnake',
}

export interface RequestConfig {
  protocol?: 'http' | 'https' | 'http2';
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: any;
  httpsAgent?: any;
  parameterStyle?: 'SnakeToCamel' | 'CamelToSnake';
  logger?: Logger | LoggerService;
  requestInterceptors?: Array<{
    onFulfilled?: (
      value: AxiosRequestConfig,
    ) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    onRejected?: (error: any) => any;
  }>;
  responseInterceptors?: Array<{
    onFulfilled?: (
      value: AxiosResponse,
    ) => AxiosResponse | Promise<AxiosResponse>;
    onRejected?: (error: any) => any;
  }>;
}

export interface RequestAsyncConfig {
  name?: string;
  useFactory: (...args: any[]) => Promise<RequestConfig> | RequestConfig;
  inject?: FactoryProvider['inject'];
}

