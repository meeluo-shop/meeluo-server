import * as path from 'path';
import { address } from 'ip';

export default {
  env: process.env.NODE_ENV,
  appName: 'node-meeluo',
  ip: address('public', 'ipv4'),
  port: process.env.NEST_APPLICATION_PORT || 3000,
  rootDir: path.join(__dirname, '..'),
};
