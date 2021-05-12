import { ClientOpts } from 'redis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

export default {
  host: REDIS_HOST,
  port: REDIS_PORT || 6379,
  password: REDIS_PASSWORD,
  db: 1,
  ttl: null,
  defaultCacheTTL: 60 * 60 * 24,
} as ClientOpts;
