import * as path from 'path';
import * as color from 'cli-color';
import { format, transports, LoggerOptions } from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import globalConfig from './global.config';

const loggerEnv = process.env.NODE_LOGGER_ENV;
const logDir = path.resolve(globalConfig.rootDir, '../logs');
const logTransports = [];

const transportConsole = new transports.Console();
const transportDailyRotate = new DailyRotateFile({
  dirname: logDir,
  filename: `${globalConfig.appName}.%DATE%.log`,
  datePattern: 'YYYYMMDD',
  zippedArchive: true,
  maxSize: '50m',
  maxFiles: '7d',
});
const transportFile = new transports.File({
  dirname: logDir,
  filename: 'error.log',
  level: 'error',
});

if (loggerEnv === 'dev') {
  logTransports.push(transportConsole)
} else {
  // 生产环境，不在控制台输出日志，为了不生成pm2日志
  logTransports.push(transportDailyRotate, transportFile)
}

export default {
  logDir,
  level: process.env.NEST_LOGGER_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD, HH:mm:ss.SSS' }),
    format.printf(info => {
      // @ts-ignore
      if (info.message instanceof Error) {
        info.message = info.message.stack;
      }
      let levelMessage = `[${info.level.toLocaleUpperCase()}]`;
      switch (info.level) {
        case 'warn':
          levelMessage = color.yellow(levelMessage);
          break;
        case 'error':
          levelMessage = color.red(levelMessage);
          break;
        default:
          levelMessage = color.blue(levelMessage);
          break;
      }
      const pidMessage = color.green(`[Nest] ${process.pid}`);
      const ctxMessage = color.yellow(`[${info.context || 'DefaultContext'}]`);
      return `${pidMessage}   - ${info.timestamp}  ${ctxMessage} ${levelMessage} ${info.message}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: logDir,
      filename: `${globalConfig.appName}.%DATE%.log`,
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '7d',
    }),
    new transports.File({
      dirname: logDir,
      filename: 'error.log',
      level: 'error',
    })],
} as LoggerOptions;
