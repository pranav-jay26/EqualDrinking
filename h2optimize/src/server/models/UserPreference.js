/**
 * User Preference model
 * Stores user's saved items and search history
 */
const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  appliance: {
    type: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    year: { type: String }
  },
  resultCount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const userPreferenceSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  savedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  searchHistory: [searchHistorySchema],
  preferences: {
    preferWaterEfficiency: { type: Boolean, default: true },
    preferEnergyEfficiency: { type: Boolean, default: true },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 2000 }
    },
    preferredVendors: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure each user can only have one preference document
userPreferenceSchema.index({ userId: 1 }, { unique: true });

// Pre-save hook to update 'updatedAt' field
userPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add a product to saved items
userPreferenceSchema.methods.saveProduct = async function(productId) {
  if (!this.savedProducts.includes(productId)) {
    this.savedProducts.push(productId);
    await this.save();
    return true;
  }
  return false;
};

// Method to remove a product from saved items
userPreferenceSchema.methods.unsaveProduct = async function(productId) {
  if (this.savedProducts.includes(productId)) {
    this.savedProducts = this.savedProducts.filter(id => id.toString() !== productId.toString());
    await this.save();
    return true;
  }
  return false;
};

// Method to add a search to history
userPreferenceSchema.methods.addSearchToHistory = async function(search, resultCount) {
  // Keep only the most recent 20 searches
  if (this.searchHistory.length >= 20) {
    this.searchHistory.pop(); // Remove oldest search
  }
  
  this.searchHistory.unshift({
    appliance: search,
    resultCount,
    date: new Date()
  });
  
  await this.save();
  return this.searchHistory[0];
};

// Static method to find or create user preferences
userPreferenceSchema.statics.findOrCreate = async function(userId) {
  let userPref = await this.findOne({ userId });
  
  if (!userPref) {
    userPref = new this({
      userId,
      savedProducts: [],
      searchHistory: [],
      preferences: {
        preferWaterEfficiency: true,
        preferEnergyEfficiency: true,
        priceRange: {
          min: 0,
          max: 2000
        },
        preferredVendors: []
      }
    });
    await userPref.save();
  }
  
  return userPref;
};

const UserPreference = mongoose.models.UserPreference || mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;
