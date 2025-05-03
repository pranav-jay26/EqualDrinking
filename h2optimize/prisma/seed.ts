/**
 * Database seeder
 * Populate the SQLite database with sample product data
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding the database...');
  
  // Clear existing data
  await prisma.savedProduct.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.priceListing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userPreference.deleteMany();
  
  console.log('Existing data cleared');
  
  // Create products with price listings
  const dishwasher = await prisma.product.create({
    data: {
      name: 'Super Efficient Dishwasher X5000',
      brand: 'EcoClean',
      model: 'EC-5000',
      category: 'Dishwasher',
      energyStar: true,
      waterSense: true,
      energyUse: 190,
      waterUse: 3.1,
      imageUrl: 'https://placehold.co/600x400?text=Dishwasher',
      efficiencyScore: 92,
      savingEstimate: '$120/year in water and electricity',
      priceListings: {
        create: [
          {
            vendor: 'Amazon',
            price: 649.99,
            url: 'https://example.com/product1-amazon',
          },
          {
            vendor: 'Best Buy',
            price: 699.99,
            url: 'https://example.com/product1-bestbuy',
          },
        ],
      },
    },
  });
  
  const washingMachine = await prisma.product.create({
    data: {
      name: 'HydroSaver Pro Washing Machine',
      brand: 'AquaEfficient',
      model: 'AE-8000',
      category: 'Washing Machine',
      energyStar: true,
      waterSense: true,
      energyUse: 210,
      waterUse: 10.5,
      imageUrl: 'https://placehold.co/600x400?text=WashingMachine',
      efficiencyScore: 88,
      savingEstimate: '$90/year in water and electricity',
      priceListings: {
        create: [
          {
            vendor: 'Amazon',
            price: 899.99,
            url: 'https://example.com/product2-amazon',
          },
          {
            vendor: 'Home Depot',
            price: 849.99,
            url: 'https://example.com/product2-homedepot',
          },
        ],
      },
    },
  });
  
  const toilet = await prisma.product.create({
    data: {
      name: 'EcoFlush Toilet',
      brand: 'WaterSave',
      model: 'WS-1000',
      category: 'Toilet',
      energyStar: false,
      waterSense: true,
      waterUse: 1.28,
      imageUrl: 'https://placehold.co/600x400?text=Toilet',
      efficiencyScore: 95,
      savingEstimate: '$70/year in water costs',
      priceListings: {
        create: [
          {
            vendor: "Lowe's",
            price: 299.99,
            url: 'https://example.com/product3-lowes',
          },
          {
            vendor: 'Home Depot',
            price: 329.99,
            url: 'https://example.com/product3-homedepot',
          },
        ],
      },
    },
  });
  
  const showerHead = await prisma.product.create({
    data: {
      name: 'EcoFlow Shower Head Pro',
      brand: 'WaterWise',
      model: 'EF-SH200',
      category: 'Shower',
      energyStar: false,
      waterSense: true,
      waterUse: 1.5,
      imageUrl: 'https://placehold.co/600x400?text=ShowerHead',
      efficiencyScore: 95,
      savingEstimate: '$80/year in water costs',
      priceListings: {
        create: [
          {
            vendor: 'Amazon',
            price: 49.99,
            url: 'https://example.com/product4-amazon',
          },
          {
            vendor: 'Home Depot',
            price: 54.99,
            url: 'https://example.com/product4-homedepot',
          },
        ],
      },
    },
  });
  
  const faucet = await prisma.product.create({
    data: {
      name: 'WaterSense Kitchen Faucet',
      brand: 'FlowControl',
      model: 'FC-KF100',
      category: 'Faucet',
      energyStar: false,
      waterSense: true,
      waterUse: 1.8,
      imageUrl: 'https://placehold.co/600x400?text=Faucet',
      efficiencyScore: 90,
      savingEstimate: '$50/year in water costs',
      priceListings: {
        create: [
          {
            vendor: 'Amazon',
            price: 79.99,
            url: 'https://example.com/product5-amazon',
          },
          {
            vendor: "Lowe's",
            price: 89.99,
            url: 'https://example.com/product5-lowes',
          },
        ],
      },
    },
  });
  
  // Create a sample user preference
  const userPref = await prisma.userPreference.create({
    data: {
      userId: 'user_example',
      preferWaterEfficiency: true,
      preferEnergyEfficiency: true,
      priceRangeMin: 0,
      priceRangeMax: 1000,
      preferredVendors: 'Amazon,Home Depot',
      // Save some products for this user
      savedProducts: {
        create: [
          {
            productId: dishwasher.id,
          },
          {
            productId: showerHead.id,
          },
        ],
      },
      // Add search history
      searchHistory: {
        create: [
          {
            applianceType: 'Dishwasher',
            applianceBrand: 'GE',
            applianceModel: 'Profile 4000',
            applianceYear: '2010',
            resultCount: 3,
            searchDate: new Date('2025-05-01'),
          },
          {
            applianceType: 'Shower',
            applianceBrand: 'Moen',
            applianceModel: 'Rainfall S200',
            applianceYear: '2015',
            resultCount: 4,
            searchDate: new Date('2025-04-28'),
          },
        ],
      },
    },
  });
  
  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.product.count()} products`);
  console.log(`Created ${await prisma.priceListing.count()} price listings`);
  console.log(`Created ${await prisma.userPreference.count()} user preferences`);
  console.log(`Created ${await prisma.savedProduct.count()} saved products`);
  console.log(`Created ${await prisma.searchHistory.count()} search history items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
