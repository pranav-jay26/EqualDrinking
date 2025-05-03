/**
 * API route for user preferences
 * Handles retrieving and updating user preferences, saved items, and search history
 */
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Ensure authentication
 * Helper function to check if user is authenticated
 */
async function ensureAuth(request) {
  const auth = await getAuth(request);
  
  if (!auth.userId) {
    return { isAuthenticated: false, userId: null };
  }
  
  return { isAuthenticated: true, userId: auth.userId };
}

/**
 * GET handler 
 * Retrieves user preferences, saved items and search history
 */
export async function GET(request) {
  // Check authentication
  const { isAuthenticated, userId } = await ensureAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    console.log('Retrieving user preferences', { userId });
    
    // Find or create user preferences
    let userPrefs = await prisma.userPreference.findUnique({
      where: { userId },
      include: {
        savedProducts: {
          include: {
            product: {
              include: {
                priceListings: true
              }
            }
          }
        },
        searchHistory: true
      }
    });
    
    // If user doesn't exist yet, create a new user preference record
    if (!userPrefs) {
      userPrefs = await prisma.userPreference.create({
        data: {
          userId,
          preferWaterEfficiency: true,
          preferEnergyEfficiency: true,
          priceRangeMin: 0,
          priceRangeMax: 1000,
          preferredVendors: 'Amazon,Home Depot'
        },
        include: {
          savedProducts: {
            include: {
              product: {
                include: {
                  priceListings: true
                }
              }
            }
          },
          searchHistory: true
        }
      });
    }
    
    // Format saved products
    const savedProducts = userPrefs.savedProducts.map(savedProduct => ({
      id: savedProduct.product.id,
      name: savedProduct.product.name,
      brand: savedProduct.product.brand,
      model: savedProduct.product.model,
      category: savedProduct.product.category,
      energyStar: savedProduct.product.energyStar,
      waterSense: savedProduct.product.waterSense,
      energyUse: savedProduct.product.energyUse,
      waterUse: savedProduct.product.waterUse,
      priceListings: savedProduct.product.priceListings.map(listing => ({
        vendor: listing.vendor,
        price: listing.price,
        url: listing.url
      })),
      imageUrl: savedProduct.product.imageUrl,
      efficiencyScore: savedProduct.product.efficiencyScore,
      savingEstimate: savedProduct.product.savingEstimate
    }));
    
    // Format search history
    const searchHistory = userPrefs.searchHistory.map(historyItem => ({
      id: historyItem.id,
      date: historyItem.searchDate.toISOString(),
      appliance: {
        type: historyItem.applianceType,
        brand: historyItem.applianceBrand || '',
        model: historyItem.applianceModel || '',
        year: historyItem.applianceYear || ''
      },
      resultCount: historyItem.resultCount
    }));
    
    // Format user preferences
    const preferences = {
      preferWaterEfficiency: userPrefs.preferWaterEfficiency,
      preferEnergyEfficiency: userPrefs.preferEnergyEfficiency,
      priceRange: {
        min: userPrefs.priceRangeMin,
        max: userPrefs.priceRangeMax
      },
      preferredVendors: userPrefs.preferredVendors ? userPrefs.preferredVendors.split(',') : []
    };
    
    return NextResponse.json({
      success: true,
      data: {
        savedProducts,
        searchHistory,
        preferences
      }
    });
    
  } catch (error) {
    console.error('Error retrieving user preferences', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve user preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST handler
 * Updates user preferences
 */
export async function POST(request) {
  // Check authentication
  const { isAuthenticated, userId } = await ensureAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    console.log('Updating user preferences', { userId, body });
    
    // Find or create user preferences
    let userPrefs = await prisma.userPreference.findUnique({
      where: { userId }
    });
    
    if (!userPrefs) {
      userPrefs = await prisma.userPreference.create({
        data: {
          userId,
          preferWaterEfficiency: true,
          preferEnergyEfficiency: true,
          priceRangeMin: 0,
          priceRangeMax: 1000,
          preferredVendors: 'Amazon,Home Depot'
        }
      });
    }
    
    // Update the user preferences
    if (body.preferences) {
      const updatedPrefs = {};
      
      if (body.preferences.preferWaterEfficiency !== undefined) {
        updatedPrefs.preferWaterEfficiency = body.preferences.preferWaterEfficiency;
      }
      
      if (body.preferences.preferEnergyEfficiency !== undefined) {
        updatedPrefs.preferEnergyEfficiency = body.preferences.preferEnergyEfficiency;
      }
      
      if (body.preferences.priceRange) {
        if (body.preferences.priceRange.min !== undefined) {
          updatedPrefs.priceRangeMin = body.preferences.priceRange.min;
        }
        if (body.preferences.priceRange.max !== undefined) {
          updatedPrefs.priceRangeMax = body.preferences.priceRange.max;
        }
      }
      
      if (body.preferences.preferredVendors) {
        updatedPrefs.preferredVendors = body.preferences.preferredVendors.join(',');
      }
      
      await prisma.userPreference.update({
        where: { id: userPrefs.id },
        data: updatedPrefs
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user preferences', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
