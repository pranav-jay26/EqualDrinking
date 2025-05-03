/**
 * Database connection utility
 * Manages MongoDB connections with Mongoose and provides fallback to mock data
 */
const mongoose = require('mongoose');
const dbConfig = require('../config/database.config');

// Connection state tracking
let isConnected = false;
let useMockData = process.env.USE_MOCK_DATA === 'true';

/**
 * Connect to MongoDB
 * Uses connection pooling and handles reconnection
 * Falls back to mock data if connection fails
 */
async function connectToDatabase() {
  // If mock data is enabled, don't attempt connection
  if (useMockData) {
    console.log('Using mock data instead of MongoDB connection');
    return { mockData: true };
  }
  
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }
  
  try {
    console.log('Connecting to MongoDB...', { uri: dbConfig.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') });
    
    const db = await mongoose.connect(dbConfig.uri, {
      ...dbConfig.options,
      dbName: dbConfig.dbName,
      // Set shorter timeouts to fail faster if connection is problematic
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    
    isConnected = db.connections[0].readyState === 1; // 1 = connected
    
    console.log(`MongoDB connected: ${db.connection.host}:${db.connection.port}/${db.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.info('MongoDB disconnected through app termination');
      process.exit(0);
    });
    
    return db.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB. Using mock data instead.', error);
    isConnected = false;
    useMockData = true; // Fall back to mock data if connection fails
    return { mockData: true };
  }
}

/**
 * Get mock data for a specific collection
 * @param {string} collection - Name of the collection (e.g., 'products', 'users')
 * @returns {Array} - Array of mock data objects
 */
function getMockData(collection) {
  const mockData = {
    products: [
      {
        id: '1',
        name: 'Super Efficient Dishwasher X5000',
        brand: 'EcoClean',
        model: 'EC-5000',
        category: 'Dishwasher',
        energyStar: true,
        waterSense: true,
        energyUse: 190,
        waterUse: 3.1,
        priceListings: [
          { vendor: 'Amazon', price: 649.99, url: '#' },
          { vendor: 'Best Buy', price: 699.99, url: '#' },
        ],
        imageUrl: 'https://placehold.co/600x400?text=Dishwasher',
        efficiencyScore: 92,
        savingEstimate: '$120/year in water and electricity',
      },
      {
        id: '2',
        name: 'HydroSaver Pro Washing Machine',
        brand: 'AquaEfficient',
        model: 'AE-8000',
        category: 'Washing Machine',
        energyStar: true,
        waterSense: true,
        energyUse: 210,
        waterUse: 10.5,
        priceListings: [
          { vendor: 'Amazon', price: 899.99, url: '#' },
          { vendor: 'Home Depot', price: 849.99, url: '#' },
        ],
        imageUrl: 'https://placehold.co/600x400?text=WashingMachine',
        efficiencyScore: 88,
        savingEstimate: '$90/year in water and electricity',
      },
      // More products...
    ],
    userPreferences: {
      // Mock user preferences keyed by user ID
      'user_1': {
        savedProducts: ['1', '4'],
        searchHistory: [
          {
            id: 'search1',
            date: '2025-05-01',
            appliance: {
              type: 'Dishwasher',
              brand: 'GE',
              model: 'Profile 4000',
              year: '2010',
            },
            resultCount: 3,
          },
        ],
        preferences: {
          preferWaterEfficiency: true,
          preferEnergyEfficiency: true,
          priceRange: { min: 0, max: 1000 }
        }
      }
    }
  };
  
  return mockData[collection] || [];
}

module.exports = {
  connectToDatabase,
  getConnection: () => isConnected ? mongoose.connection : { mockData: true },
  isConnected: () => isConnected,
  useMockData: () => useMockData,
  getMockData
};
