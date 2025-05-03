// services/energyStar.ts
// Functions for interacting with ENERGY STAR data

// ENERGY STAR product interface
export interface EnergyStarProduct {
  brand: string;
  model: string;
  modelNumber: string;
  productType: string;
  annualEnergyUse?: number; // kWh per year
  waterUse?: number; // gallons per use
  energyStarCertified: boolean;
}

/**
 * Find an ENERGY STAR model by model number
 */
export async function findEnergyStarModel(modelNumber: string): Promise<EnergyStarProduct | null> {
  // In a real implementation, this would query the ENERGY STAR API
  // For now, we'll return mock data if the model number matches known patterns
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const mockData: Record<string, EnergyStarProduct> = {
    'WM3900HWA': {
      brand: 'LG',
      model: 'Front Load Washer with TurboWash',
      modelNumber: 'WM3900HWA',
      productType: 'washer',
      annualEnergyUse: 105,
      waterUse: 10.5,
      energyStarCertified: true
    },
    'SHEM78Z52N': {
      brand: 'Bosch',
      model: '800 Series Dishwasher',
      modelNumber: 'SHEM78Z52N',
      productType: 'dishwasher',
      annualEnergyUse: 269,
      waterUse: 3.2,
      energyStarCertified: true
    },
    'RF28R7551SR': {
      brand: 'Samsung',
      model: '28 cu. ft. French Door Refrigerator',
      modelNumber: 'RF28R7551SR',
      productType: 'refrigerator',
      annualEnergyUse: 687,
      energyStarCertified: true
    }
  };
  
  return mockData[modelNumber] || null;
}

/**
 * Get all ENERGY STAR certified products for a specific type
 */
export async function getEnergyStarProducts(productType: string): Promise<EnergyStarProduct[]> {
  // In a real implementation, this would query the ENERGY STAR API
  // For now, we'll return mock data based on product type
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Normalize product type
  let normalizedType = productType.toLowerCase();
  if (normalizedType === 'washing machine') normalizedType = 'washer';
  if (normalizedType === 'fridge') normalizedType = 'refrigerator';
  
  // Mock data by product type
  const mockData: Record<string, EnergyStarProduct[]> = {
    'washer': [
      {
        brand: 'LG',
        model: 'Front Load Washer with TurboWash',
        modelNumber: 'WM3900HWA',
        productType: 'washer',
        annualEnergyUse: 105,
        waterUse: 10.5,
        energyStarCertified: true
      },
      {
        brand: 'Samsung',
        model: 'High-Efficiency Front Load Washer',
        modelNumber: 'WF45R6100AW',
        productType: 'washer',
        annualEnergyUse: 120,
        waterUse: 12.0,
        energyStarCertified: true
      },
      {
        brand: 'Whirlpool',
        model: 'Smart Front Load Washer',
        modelNumber: 'WFW9620HW',
        productType: 'washer',
        annualEnergyUse: 115,
        waterUse: 13.0,
        energyStarCertified: true
      }
    ],
    'dishwasher': [
      {
        brand: 'Bosch',
        model: '800 Series Dishwasher',
        modelNumber: 'SHEM78Z52N',
        productType: 'dishwasher',
        annualEnergyUse: 269,
        waterUse: 3.2,
        energyStarCertified: true
      },
      {
        brand: 'Miele',
        model: 'G 7100 Series Dishwasher',
        modelNumber: 'G7106SCUSS',
        productType: 'dishwasher',
        annualEnergyUse: 249,
        waterUse: 3.1,
        energyStarCertified: true
      },
      {
        brand: 'KitchenAid',
        model: 'Top Control Dishwasher',
        modelNumber: 'KDTM604KPS',
        productType: 'dishwasher',
        annualEnergyUse: 255,
        waterUse: 3.4,
        energyStarCertified: true
      }
    ],
    'refrigerator': [
      {
        brand: 'Samsung',
        model: '28 cu. ft. French Door Refrigerator',
        modelNumber: 'RF28R7551SR',
        productType: 'refrigerator',
        annualEnergyUse: 687,
        energyStarCertified: true
      },
      {
        brand: 'LG',
        model: '26 cu. ft. Smart French Door Refrigerator',
        modelNumber: 'LFXS26596S',
        productType: 'refrigerator',
        annualEnergyUse: 695,
        energyStarCertified: true
      },
      {
        brand: 'GE',
        model: 'Profile 27.9 cu. ft. Smart 4-Door French Door Refrigerator',
        modelNumber: 'PVD28BYNFS',
        productType: 'refrigerator',
        annualEnergyUse: 698,
        energyStarCertified: true
      }
    ]
  };
  
  return mockData[normalizedType] || [];
}
