// services/waterSense.ts
// Functions for interacting with WaterSense data

// WaterSense product interface
export interface WaterSenseProduct {
  manufacturer: string;
  productName: string;
  modelNumber: string;
  productType: string;
  flowRate?: number; // gallons per minute/flush
  waterSenseCertified: boolean;
  productPageUrl: string;
}

/**
 * Find WaterSense products by type
 */
export async function findWaterSenseProducts(productType: string): Promise<WaterSenseProduct[]> {
  // In a real implementation, this would query the EPA WaterSense API
  // For now, we'll return mock data based on product type
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Normalize product type
  let normalizedType = productType.toLowerCase();
  if (normalizedType === 'showerhead') normalizedType = 'shower';
  
  // Mock data by product type
  const mockData: Record<string, WaterSenseProduct[]> = {
    'toilet': [
      {
        manufacturer: 'TOTO',
        productName: 'Drake Two-Piece Elongated Dual Flush Toilet',
        modelNumber: 'CST776CSG',
        productType: 'toilet',
        flowRate: 1.28, // gallons per flush
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=TOTO&model=CST776CSG'
      },
      {
        manufacturer: 'Kohler',
        productName: 'Santa Rosa Comfort Height One-Piece Toilet',
        modelNumber: 'K-3810',
        productType: 'toilet',
        flowRate: 1.28, // gallons per flush
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Kohler&model=K-3810'
      },
      {
        manufacturer: 'American Standard',
        productName: 'H2Option Dual Flush Elongated Toilet',
        modelNumber: '2886518.020',
        productType: 'toilet',
        flowRate: 1.0, // gallons per flush
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=American%20Standard&model=2886518.020'
      }
    ],
    'faucet': [
      {
        manufacturer: 'Moen',
        productName: 'Gibson Single-Handle Bathroom Faucet',
        modelNumber: '6142',
        productType: 'faucet',
        flowRate: 1.2, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Moen&model=6142'
      },
      {
        manufacturer: 'Delta',
        productName: 'Voyager 4 in. Centerset Single-Handle Bathroom Faucet',
        modelNumber: 'B510LF-PPU',
        productType: 'faucet',
        flowRate: 1.0, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Delta&model=B510LF-PPU'
      },
      {
        manufacturer: 'Pfister',
        productName: 'Jaida Single-Handle Pull-Down Bathroom Faucet',
        modelNumber: 'LF-042-JDGS',
        productType: 'faucet',
        flowRate: 1.2, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Pfister&model=LF-042-JDGS'
      }
    ],
    'shower': [
      {
        manufacturer: 'Moen',
        productName: 'Velocity Two-Function 8 in. Rainshower Showerhead',
        modelNumber: 'S6320EP',
        productType: 'showerhead',
        flowRate: 1.75, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Moen&model=S6320EP'
      },
      {
        manufacturer: 'Delta',
        productName: 'HydroRain 5-Spray Dual Showerhead',
        modelNumber: '58480-25',
        productType: 'showerhead',
        flowRate: 1.5, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Delta&model=58480-25'
      },
      {
        manufacturer: 'Kohler',
        productName: 'Awaken 3-Spray Showerhead',
        modelNumber: 'K-72419',
        productType: 'showerhead',
        flowRate: 1.5, // gallons per minute
        waterSenseCertified: true,
        productPageUrl: 'https://www.epa.gov/watersense/product-search?manufacturer=Kohler&model=K-72419'
      }
    ]
  };
  
  return mockData[normalizedType] || [];
}
