/**
 * Enterprise-grade logging utility
 * Based on Winston logger with multiple transports
 */
const winston = require('winston');
const { createLogger, format, transports } = winston;
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const logConfig = require('../config/logger.config');

// Ensure log directory exists
if (!fs.existsSync(logConfig.directory)) {
  fs.mkdirSync(logConfig.directory, { recursive: true });
}

// Custom format for masking sensitive data
const maskFormat = format((info) => {
  if (logConfig.maskSensitiveData) {
    const sensitiveFields = logConfig.sensitiveFields || [];
    const masked = JSON.parse(JSON.stringify(info));
    
    // Function to recursively mask sensitive fields in objects
    const maskObject = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key) && obj[key]) {
          // Mask the value but preserve length hint
          const len = String(obj[key]).length;
          obj[key] = `[REDACTED:${len}]`;
        } else if (typeof obj[key] === 'object') {
          maskObject(obj[key]);
        }
      });
    };
    
    maskObject(masked);
    return masked;
  }
  return info;
});

// Define custom format for logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  maskFormat(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Console format with colors for development
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  maskFormat(),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize({ all: logConfig.console.colorize }),
  format.printf(({ timestamp, level, message, ...rest }) => {
    // Format the main log line
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if exists and not empty
    const metadata = rest.metadata || rest;
    if (metadata && Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      // Remove circular references and format metadata
      const safeMetadata = JSON.stringify(metadata, (key, value) => {
        if (key === 'stack' && typeof value === 'string') {
          return value.split('\n').slice(0, 3).join('\n') + '...';
        }
        return value;
      }, 2);
      log += `\n${safeMetadata}`;
    }
    
    return log;
  })
);

// Create rotated file transport
const fileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logConfig.directory, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: logConfig.maxSize,
  maxFiles: logConfig.maxFiles,
  format: logFormat
});

// Create rotated error file transport
const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logConfig.directory, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: logConfig.maxSize,
  maxFiles: logConfig.maxFiles,
  level: 'error',
  format: logFormat
});

// Define transports array
const logTransports = [
  fileRotateTransport,
  errorFileRotateTransport
];

// Add console transport if enabled
if (logConfig.console.enabled) {
  logTransports.push(new transports.Console({
    format: consoleFormat
  }));
}

// Create the logger instance
const logger = createLogger({
  level: logConfig.level,
  levels: winston.config.npm.levels,
  format: logFormat,
  transports: logTransports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test' && !process.env.ENABLE_LOGS_IN_TEST
});

// Add a stream for use with Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Log any uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error, stack: error.stack });
  process.exit(1);
});

// Log any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, stack: reason?.stack });
});

module.exports = logger;
