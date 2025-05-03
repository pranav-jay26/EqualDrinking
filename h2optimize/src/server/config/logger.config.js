/**
 * Logger configuration settings
 * Controls logging behavior across the application
 */
module.exports = {
  // Log level determines the minimum severity to log
  // Options: 'error', 'warn', 'info', 'debug' (from most severe to least)
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Directory where log files will be stored
  directory: process.env.LOG_DIRECTORY || './logs',
  
  // Max size of each log file before rotation
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  
  // Max number of log files to keep
  maxFiles: process.env.LOG_MAX_FILES || 5,
  
  // Whether to mask sensitive data in logs
  maskSensitiveData: process.env.MASK_SENSITIVE_DATA !== 'false',
  
  // List of fields to mask in logs (e.g., passwords, api keys)
  sensitiveFields: [
    'password',
    'apiKey',
    'token',
    'secret',
    'authorization',
    'clerk_secret_key',
    'CLERK_SECRET_KEY'
  ],
  
  // Console logging config
  console: {
    // Whether to log to console
    enabled: process.env.LOG_CONSOLE !== 'false',
    // Whether to colorize console output
    colorize: process.env.LOG_COLORIZE !== 'false'
  },
};
