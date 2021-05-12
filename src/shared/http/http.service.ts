import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Inject,
  Injectable,
  HttpService,
  LoggerService,
  Logger,
} from '@nestjs/common';
import { HttpRequestApiException } from './http.exception';
import { HTTP_OPTION } from './http.constants';
import {
  RequestConfig,
  ParameterStyle,
} from './http.interface';
import { UtilHelperProvider } from '@shared/helper'

@Injectable()
export class HttpFetchService {
  private logger: Logger | LoggerService;

  constructor(
    @Inject(HttpService) private httpService: HttpService,
    @Inject(HTTP_OPTION) private httpOption: RequestConfig,
  ) {
    const { logger, requestInterceptors = [], responseInterceptors = [] } = this.httpOption;
    this.logger = logger || new Logger(HttpFetchService.name);
    requestInterceptors.forEach(
      ({ onFulfilled, onRejected }) => {
        this.httpService.axiosRef.interceptors.request.use(
          onFulfilled,
          onRejected,
        );
      },
    );
    this.httpService.axiosRef.interceptors.response.use(
      response => response,
      error => {
        const { response = {}, config = {} } = error;
        this.logger.error(
          `Api request failed -> status: ${response.status}; url: ${
            config.url
          }; params: ${JSON.stringify(
            config.params || {},
          )}; body: ${JSON.stringify(
            config.data || {},
          )}; response: ${JSON.stringify(response.data)}`,
        );
        throw error;
      },
    );
    responseInterceptors.forEach(
      ({ onFulfilled, onRejected }) => {
        this.httpService.axiosRef.interceptors.response.use(
          onFulfilled,
          onRejected,
        );
      },
    );
  }

  private async request<T = any>(url: string, config: AxiosRequestConfig = {}) {
    config = config || {};
    const protocol = this.httpOption.protocol || 'http';
    if (url.indexOf(protocol) !== 0) {
      url = `${protocol}://${url}`;
    }
    switch (this.httpOption.parameterStyle) {
      case ParameterStyle.CAMEL_TO_SNAKE:
        if (config.data) {
          config.data = UtilHelperProvider.humpToSnake<T>(config.data);
        }
        if (config.params) {
          config.params = UtilHelperProvider.humpToSnake<T>(config.params);
        }
        break;
      case ParameterStyle.SNAKE_TO_CAMEL:
        if (config.data) {
          config.data = UtilHelperProvider.snakeToHump<T>(config.data);
        }
        if (config.params) {
          config.params = UtilHelperProvider.snakeToHump<T>(config.params);
        }
        break;
      default:
        break;
    }
    let response: T, resp: AxiosResponse<T>;
    const stringParams = JSON.stringify(config.params || {});
    const stringBody = JSON.stringify(config.data || {});
    const start: number = new Date().getTime();
    try {
      resp = await this.httpService.axiosRef.request<T>({
        ...this.httpOption,
        ...config,
        url,
      });
      url = resp.config.url;
      this.logger.log(
        `Api request -> (${new Date().getTime() -
          start}ms) url: ${url}; params: ${stringParams}; body: ${stringBody}`,
      );
      response = resp.data;
      if (this.httpOption.parameterStyle === ParameterStyle.CAMEL_TO_SNAKE) {
        response = UtilHelperProvider.snakeToHump<T>(response as any || {});
      } else if (
        this.httpOption.parameterStyle === ParameterStyle.SNAKE_TO_CAMEL
      ) {
        response = UtilHelperProvider.humpToSnake<T>(response as any || {});
      }
    } catch (err) {
      throw new HttpRequestApiException({
        msg: err.message,
      });
    }
    return response;
  }

  async post<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'post',
    });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'get',
    });
  }

  async put<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'put',
    });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'delete',
    });
  }

  async patch<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'patch',
    });
  }

  async head<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'head',
    });
  }
}
