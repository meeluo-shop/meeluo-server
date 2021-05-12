import { JwtOption } from '@jiaxinjiang/nest-jwt';

export default {
  secret: 'Functors123!@#',
  sign: {
    expiresIn: 30 * 24 * 3600, // jwt过期时间设为30天，主要由redis控制登陆会话时长。
  },
  verify: {},
  decode: {},
} as JwtOption;
