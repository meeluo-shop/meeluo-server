import { RequestConfig, ParameterStyle } from '@shared/http';

export default {
  timeout: 8000,
  protocol: 'http',
  parameterStyle: ParameterStyle.CAMEL_TO_SNAKE,
} as RequestConfig;
