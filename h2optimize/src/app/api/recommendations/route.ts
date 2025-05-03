/**
 * API route for appliance recommendations with AI scraper integration
 */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runScraper } from '@/server/services/scraperAgent';
import { getEnergyStarProducts } from '@/server/services/energyStar';
import { findWaterSenseProducts } from '@/server/services/waterSense';
import { nanoid } from 'nanoid';

interface PriceListing {
  vendor: string;
  price: number;
  url: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  energyStar: boolean;
  waterSense: boolean;
  energyUse?: number;
  waterUse?: number;
  priceListings: PriceListing[];
  imageUrl?: string;
  efficiencyScore?: number;
  savingEstimate?: string;
}

/**
 * GET handler for recommendations
 * Uses AI scraper service to find relevant products
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const category = searchParams.get('type') || '';
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year');
  
  console.log('Recommendation search request', { category, brand, model, year });
  
  try {
    let recommendations: ProductRecommendation[] = [];
    
    // First check if we have recommendations in the database
    // (Database approach is disabled for now until Prisma schema is updated)
    // Instead, we'll use the AI scraper to get recommendations
    
    // Use the AI scraper to find recommendations if we have enough input data
    if (category && (brand || model)) {
      console.log('Using AI scraper to find recommendations');
      
      // Use the AI scraper to find recommendations
      const scrapeResults = await runScraper({
        searchId: nanoid(),
        appliance: category,
        make: brand || 'unknown',
        model: model || 'unknown',
        year: year ? parseInt(year) : new Date().getFullYear() - 5
      });
      
      // Get ENERGY STAR and WaterSense products to enhance results
      const energyStarProducts = await getEnergyStarProducts(category);
      let waterSenseProducts: any[] = [];
      
      if (['toilet', 'faucet', 'shower', 'showerhead'].includes(category.toLowerCase())) {
        waterSenseProducts = await findWaterSenseProducts(category);
      }
      
      // Process scraper results into recommendations
      const aiRanking = scrapeResults.find(item => item.source === 'AI_Rankings');
      const aiItems = scrapeResults.filter(item => item.source === 'AI Search').map(item => ({
        id: `ai-${nanoid(6)}`,
        name: item.title,
        brand: item.title.split(' ')[0] || 'Unknown',
        model: item.modelNumber || 'Custom Model',
        category: category,
        energyStar: false,
        waterSense: false,
        priceListings: item.price ? [{ 
          vendor: 'Estimated', 
          price: item.price, 
          url: item.url 
        }] : [],
        efficiencyScore: item.efficiencyScore,
        savingEstimate: generateSavingsEstimate(category, item.efficiencyScore ? item.efficiencyScore / 10 : undefined)
      }));
      
      // Add energy star products as recommendations
      const energyStarItems = energyStarProducts.map(product => ({
        id: `es-${nanoid(6)}`,
        name: `${product.brand} ${product.model}`,
        brand: product.brand,
        model: product.modelNumber,
        category: category,
        energyStar: product.energyStarCertified,
        waterSense: false,
        energyUse: product.annualEnergyUse,
        waterUse: product.waterUse,
        priceListings: [],
        efficiencyScore: product.annualEnergyUse ? 100 - (product.annualEnergyUse / 10) : undefined,
        savingEstimate: generateSavingsEstimate(category, product.waterUse)
      }));
      
      const waterSenseItems = waterSenseProducts.map((product: any) => ({
        id: `ws-${nanoid(6)}`,
        name: product.productName,
        brand: product.manufacturer,
        model: product.modelNumber,
        category: category,
        energyStar: false,
        waterSense: true,
        waterUse: product.flowRate,
        priceListings: [],
        efficiencyScore: product.flowRate ? 100 - (product.flowRate * 20) : undefined,
        savingEstimate: generateSavingsEstimate(category, product.flowRate)
      }));
      
      // Combine all recommendations
      recommendations = [...aiItems, ...energyStarItems, ...waterSenseItems];
      
      // Add AI ranking as a special recommendation to display
      if (aiRanking) {
        recommendations.unshift({
          id: `ai-ranking-${nanoid(6)}`,
          name: "AI Recommendations Analysis",
          brand: "H2Optimize",
          model: "AI Recommendation",
          category: category,
          energyStar: false,
          waterSense: false,
          priceListings: [],
          savingEstimate: aiRanking.title,
          imageUrl: "https://source.unsplash.com/featured/?water,conservation",
          efficiencyScore: 100 // Give it a perfect score since it's our AI analysis
        });
      }
    }
    
    console.log(`Returning ${recommendations.length} recommendations`);
    
    return NextResponse.json({ 
      success: true, 
      count: recommendations.length,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Error getting recommendations', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate savings estimates
 */
function generateSavingsEstimate(category: string, efficiency?: number): string {
  if (!efficiency) return "Potential savings data not available";
  
  const savingsMap: Record<string, (e: number) => string> = {
    'washer': (e) => `Save up to ${Math.floor(4000 - e*300)} gallons of water per year`,
    'washing machine': (e) => `Save up to ${Math.floor(4000 - e*300)} gallons of water per year`,
    'dishwasher': (e) => `Save up to ${Math.floor(1500 - e*450)} gallons of water per year`,
    'shower': (e) => `Save up to ${Math.floor((7.5-e)*1000)} gallons of water per year`,
    'showerhead': (e) => `Save up to ${Math.floor((7.5-e)*1000)} gallons of water per year`,
    'toilet': (e) => `Save up to ${Math.floor((3.5-e)*1000)} gallons of water per year`,
    'faucet': (e) => `Save up to ${Math.floor((2.5-e)*800)} gallons of water per year`
  };
  
  const normalizedCategory = category.toLowerCase();
  const estimator = savingsMap[normalizedCategory];
  
  return estimator ? estimator(efficiency) : "Estimated savings data not available";
}

/**
 * POST handler 
 * Handles more complex searches and filtering with AI enhancements
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Recommendation search with criteria', body);
    
    // We'll just redirect to the GET handler with query params for now
    // In the future we can add more complex filtering logic here
    
    // Extract basic search parameters
    const category = body.category || '';
    const brand = body.brand || '';
    const model = body.model || '';
    const year = body.year || '';
    
    // Use the same scraper logic as GET handler
    if (category && (brand || model)) {
      const scrapeResults = await runScraper({
        searchId: nanoid(),
        appliance: category,
        make: brand || 'unknown',
        model: model || 'unknown',
        year: year ? parseInt(year) : new Date().getFullYear() - 5
      });
      
      // Convert results to recommendations format
      const recommendations = scrapeResults
        .filter(item => item.source !== 'AI_Rankings')
        .map(item => ({
          id: `sr-${nanoid(6)}`,
          name: item.title,
          brand: item.title.split(' ')[0] || 'Unknown',
          model: item.modelNumber || 'Custom Model',
          category: category,
          energyStar: item.source.includes('ENERGY_STAR'),
          waterSense: item.source.includes('WaterSense'),
          priceListings: item.price ? [{ 
            vendor: item.source, 
            price: item.price, 
            url: item.url 
          }] : [],
          efficiencyScore: item.efficiencyScore,
          savingEstimate: generateSavingsEstimate(category, item.efficiencyScore ? item.efficiencyScore / 10 : undefined),
          imageUrl: item.url.includes('unsplash.com') ? item.url : 'https://source.unsplash.com/featured/?appliance'
        }));
      
      // Add ranking as a special first item
      const aiRanking = scrapeResults.find(item => item.source === 'AI_Rankings');
      if (aiRanking) {
        recommendations.unshift({
          id: `ai-ranking-${nanoid(6)}`,
          name: "AI Recommendations Analysis",
          brand: "H2Optimize",
          model: "AI Recommendation",
          category: category,
          energyStar: false,
          waterSense: false,
          priceListings: [],
          savingEstimate: aiRanking.title,
          imageUrl: "https://source.unsplash.com/featured/?water,conservation",
          efficiencyScore: 100 // Give it a perfect score since it's our AI analysis
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        count: recommendations.length,
        data: recommendations
      });
    }
    
    // Return empty results if we don't have enough search criteria
    return NextResponse.json({ 
      success: true, 
      count: 0,
      data: []
    });
    
  } catch (error) {
    console.error('Error getting recommendations with filters', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
