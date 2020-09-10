import winston from 'winston';
import GrayLogTransport from './GrayLogTransport';
import formatMessage from './formatMessage';

let DATABASE_NAME = 'localhost';
let LOGS_DIR = './log';

const formatter = winston.format.printf(info => formatMessage(info, DATABASE_NAME));

const createFileTransport = () =>
  new winston.transports.File({
    filename: `${LOGS_DIR}/error.log`,
    handleExceptions: true,
    level: 'error',
    format: winston.format.combine(winston.format.timestamp(), formatter),
  });

const consoleTransport = new winston.transports.Console({
  handleExceptions: true,
  level: 'error',
  format: winston.format.combine(winston.format.timestamp(), formatter),
});

export const createErrorLog = () => {
  DATABASE_NAME = process.env.DATABASE_NAME ? process.env.DATABASE_NAME : 'localhost';
  LOGS_DIR = process.env.LOGS_DIR ? process.env.LOGS_DIR : './log';

  const logger = winston.createLogger({
    transports: [createFileTransport(), consoleTransport],
  });

  logger.closeGraylog = (cb = () => {}) => {
    cb();
  };

  if (process.env.USE_GRAYLOG) {
    const graylogTransport = new GrayLogTransport({
      format: winston.format.combine(winston.format.timestamp(), formatter),
      instance_name: DATABASE_NAME,
      server: process.env.USE_GRAYLOG,
    });
    logger.add(graylogTransport);
    logger.closeGraylog = graylogTransport.graylog.close.bind(graylogTransport.graylog);
  }

  return logger;
};

const errorLog = createErrorLog();

//backwad compatibility, deprecated in favor of named export
export default errorLog;

export { errorLog };
