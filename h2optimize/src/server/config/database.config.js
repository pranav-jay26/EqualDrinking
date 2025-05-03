/**
 * Database configuration
 * Centralizes database settings and connection options
 */
module.exports = {
  // MongoDB connection URI
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/h2optimize',
  
  // Connection options
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  
  // Database name - will override any DB name in the URI
  dbName: process.env.DB_NAME || 'h2optimize'
};
