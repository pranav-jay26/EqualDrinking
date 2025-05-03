/**
 * Product model
 * Represents appliance products in the marketplace
 */
const mongoose = require('mongoose');

const priceListingSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  price: { type: Number, required: true },
  url: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Dishwasher', 'Washing Machine', 'Shower', 'Faucet', 'Toilet', 'Other'] 
  },
  description: { type: String },
  energyStar: { type: Boolean, default: false },
  waterSense: { type: Boolean, default: false },
  energyUse: { type: Number }, // kWh/year
  waterUse: { type: Number }, // gallons per use or per cycle
  priceListings: [priceListingSchema],
  imageUrl: { type: String },
  efficiencyScore: { 
    type: Number, 
    min: 0, 
    max: 100,
    default: 50 
  },
  savingEstimate: { type: String },
  specifications: { type: Map, of: mongoose.Schema.Types.Mixed },
  sourceUrl: { type: String }, // where this data was scraped from
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text search indexes
productSchema.index({ 
  name: 'text', 
  brand: 'text', 
  model: 'text',
  description: 'text'
});

// Add compound index for filtering
productSchema.index({ category: 1, energyStar: 1, waterSense: 1 });
productSchema.index({ brand: 1, model: 1 }, { unique: true });

// Pre-save hook to update 'updatedAt' field
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full product name
productSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} ${this.name}`;
});

// Static method to find similar products
productSchema.statics.findSimilar = async function(productId) {
  const product = await this.findById(productId);
  if (!product) return [];
  
  return this.find({
    category: product.category,
    _id: { $ne: product._id },
    $or: [
      { brand: product.brand },
      { efficiencyScore: { $gte: product.efficiencyScore } }
    ]
  }).limit(5);
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
