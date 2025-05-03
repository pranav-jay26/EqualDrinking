// services/scraperAgent.ts
// Autonomous AI scraper agent for finding water-efficient appliance replacements

import OpenAI from 'openai';
import { findEnergyStarModel, getEnergyStarProducts } from './energyStar';
import { findWaterSenseProducts } from './waterSense';

// Initialize OpenAI client with fallback for development environments
let openai: any;

const mockOpenAIClient = {
  chat: {
    completions: {
      create: async () => {
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                alternatives: [
                  {
                    title: "LG High-Efficiency Front Load Washer",
                    brand: "LG",
                    modelNumber: "WM3900HWA",
                    price: "699.99",
                    url: "https://www.example.com/lg-washer",
                    waterEfficiency: "10.5 gallons per cycle",
                    energyEfficiency: "Energy Star certified, 105 kWh/year"
                  },
                  {
                    title: "Samsung EcoBubble Washing Machine",
                    brand: "Samsung",
                    modelNumber: "WF45R6100AW",
                    price: "799.99",
                    url: "https://www.example.com/samsung-washer",
                    waterEfficiency: "12.0 gallons per cycle",
                    energyEfficiency: "Energy Star certified, 120 kWh/year"
                  }
                ]
              })
            }
          }]
        };
      }
    }
  }
};

try {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (error) {
  console.warn('OpenAI API key not found, using mock implementation');
  // Use the mock client instead
  openai = mockOpenAIClient;
}

// Interface for search task data
export interface ScrapeTask {
  searchId: string;
  appliance: string;
  make: string;
  model: string;
  year: number;
}

// Result item interface
export interface ScrapeItem {
  title: string;
  url: string;
  price?: number;
  source: string;
  modelNumber?: string;
  efficiencyScore?: number;
}

/**
 * Use GPT to find efficient appliance replacements
 */
async function searchGptForAlternatives(appliance: string, make: string, model: string, year: number): Promise<ScrapeItem[]> {
  try {
    // Create a prompt that asks GPT to find efficient alternatives
    const prompt = `Find 5 water and energy efficient alternatives to replace a ${year} ${make} ${model} ${appliance}. 
      For each alternative, provide: 
      1. The product name
      2. The brand
      3. The model number
      4. The estimated price
      5. A fictional URL where it could be purchased
      6. Water efficiency metrics (if applicable)
      7. Energy efficiency metrics (if applicable)

      Format the response as a JSON array with objects containing these properties: title, brand, modelNumber, price, url, waterEfficiency, energyEfficiency`;

    // Call GPT to get alternatives
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that specializes in finding water and energy efficient appliance replacements. Provide accurate, well-structured information in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON and extract the alternatives
    const parsedResponse = JSON.parse(responseContent);
    const alternatives = parsedResponse.alternatives || [];

    // Transform to ScrapeItem format
    return alternatives.map((alt: any, index: number) => ({
      title: alt.title || `Alternative ${index + 1}`,
      url: alt.url || "https://example.com/product",
      price: parseFloat(alt.price) || undefined,
      source: "AI Search",
      modelNumber: alt.modelNumber,
      efficiencyScore: calculateEfficiencyScore(alt.waterEfficiency, alt.energyEfficiency)
    }));
  } catch (e) {
    console.warn('GPT search failed', e);
    return [];
  }
}

/**
 * Calculate efficiency score based on water and energy metrics
 */
function calculateEfficiencyScore(waterEfficiency?: string, energyEfficiency?: string): number | undefined {
  if (!waterEfficiency && !energyEfficiency) return undefined;
  
  // Extract any numbers from the efficiency strings
  const waterMatches = waterEfficiency?.match(/\d+(\.\d+)?/g);
  const energyMatches = energyEfficiency?.match(/\d+(\.\d+)?/g);
  
  const waterValue = waterMatches?.length ? parseFloat(waterMatches[0]) : 0;
  const energyValue = energyMatches?.length ? parseFloat(energyMatches[0]) : 0;
  
  // Simple algorithm to calculate a score between 0-100
  // Higher is better, assuming lower water/energy usage is better
  if (waterValue && energyValue) {
    return Math.min(100, Math.max(0, 100 - (waterValue + energyValue) / 2));
  } else if (waterValue) {
    return Math.min(100, Math.max(0, 100 - waterValue * 10));
  } else if (energyValue) {
    return Math.min(100, Math.max(0, 100 - energyValue / 10));
  }
  
  return 50; // Default score if we can't calculate
}

/**
 * Core function: given a task, use GPT to generate alternatives, enrich with efficiency data,
 * and rank results.
 */
export async function runScraper(task: ScrapeTask): Promise<ScrapeItem[]> {
  const { appliance, make, model, year } = task;

  // Step 1: Get recommendations from GPT
  const gptAlternatives = await searchGptForAlternatives(appliance, make, model, year);
  
  // Step 2: Get ENERGY STAR products for this appliance type
  const energyStarProducts = await getEnergyStarProducts(appliance);
  const energyStarItems = energyStarProducts.map(product => ({
    title: `${product.brand} ${product.model}`,
    url: `https://www.energystar.gov/productfinder/${encodeURIComponent(appliance)}/${encodeURIComponent(product.modelNumber)}`,
    price: undefined,
    source: 'ENERGY STAR',
    modelNumber: product.modelNumber,
    efficiencyScore: product.annualEnergyUse ? 100 - (product.annualEnergyUse / 10) : undefined
  }));
  
  // Step 3: For fixtures, get WaterSense products
  let waterSenseItems: ScrapeItem[] = [];
  if (['toilet', 'faucet', 'shower', 'showerhead'].includes(appliance.toLowerCase())) {
    const waterSenseProducts = await findWaterSenseProducts(appliance);
    waterSenseItems = waterSenseProducts.map(product => ({
      title: product.productName,
      url: product.productPageUrl,
      price: undefined,
      source: 'WaterSense',
      modelNumber: product.modelNumber,
      efficiencyScore: product.flowRate ? 100 - (product.flowRate * 10) : undefined
    }));
  }
  
  // Step 4: Combine all recommendations
  const allItems = [...gptAlternatives, ...energyStarItems, ...waterSenseItems];
  
  // Step 5: Deduplicate by model number if available
  const uniqueItems = new Map<string, ScrapeItem>();
  allItems.forEach(item => {
    if (item.modelNumber) {
      uniqueItems.set(item.modelNumber, item);
    } else {
      // For items without model numbers, use the title
      uniqueItems.set(item.title, item);
    }
  });
  
  // Step 6: Get the final list of alternatives
  const alternatives = Array.from(uniqueItems.values());
  
  // Step 7: Ask GPT to rank and provide a narrative on the best options
  try {
    const rankingPrompt = `The user needs to replace their ${year} ${make} ${model} ${appliance} with a more water and energy efficient alternative. Here are the options:\n\n${alternatives.map((item, index) => 
      `${index + 1}. ${item.title} (${item.source})${item.efficiencyScore ? ` - Efficiency Score: ${Math.round(item.efficiencyScore)}` : ''}`
    ).join('\n')}\n\nRank the top 5 best alternatives based on water and energy efficiency. Explain the benefits of each alternative and why it would be a good replacement.`;
    
    const rankingCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a specialized assistant for recommending water and energy efficient appliances. Provide detailed insights on why certain alternatives are better choices."
        },
        {
          role: "user",
          content: rankingPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const analysis = rankingCompletion.choices[0].message.content;
    
    // Return both the alternatives and the analysis
    return [
      // Add the analysis as a special item
      {
        title: analysis || "AI Analysis Not Available",
        url: "",
        source: "AI_Rankings"
      },
      // Then include all the actual alternatives
      ...alternatives
    ];
  } catch (e) {
    console.warn('GPT ranking failed', e);
    return alternatives;
  }
}
