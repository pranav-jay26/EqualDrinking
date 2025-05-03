/**
 * API route for user's saved products
 * Handles saving, unsaving, and retrieving saved products
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
 * Retrieves all saved products for a user
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
    console.log('Retrieving saved products', { userId });
    
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
        }
      }
    });
    
    // If user doesn't exist yet, create an empty record
    if (!userPrefs) {
      userPrefs = await prisma.userPreference.create({
        data: {
          userId,
          preferWaterEfficiency: true,
          preferEnergyEfficiency: true,
          priceRangeMin: 0,
          priceRangeMax: 1000
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
          }
        }
      });
    }
    
    // Format saved products for the frontend
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
    
    return NextResponse.json({
      success: true,
      data: savedProducts
    });
    
  } catch (error) {
    console.error('Error retrieving saved products', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve saved products' },
      { status: 500 }
    );
  }
}

/**
 * POST handler
 * Saves a product to user's saved items
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
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Saving product for user', { userId, productId });
    
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
          priceRangeMax: 1000
        }
      });
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if product is already saved
    const existingSaved = await prisma.savedProduct.findFirst({
      where: {
        userPreferenceId: userPrefs.id,
        productId
      }
    });
    
    if (existingSaved) {
      return NextResponse.json({
        success: true,
        message: 'Product already saved'
      });
    }
    
    // Save the product
    await prisma.savedProduct.create({
      data: {
        userPreferenceId: userPrefs.id,
        productId
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving product', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to save product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler
 * Removes a product from user's saved items
 */
export async function DELETE(request) {
  // Check authentication
  const { isAuthenticated, userId } = await ensureAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Unsaving product for user', { userId, productId });
    
    // Find user preferences
    const userPrefs = await prisma.userPreference.findUnique({
      where: { userId }
    });
    
    if (!userPrefs) {
      return NextResponse.json(
        { success: false, error: 'User preferences not found' },
        { status: 404 }
      );
    }
    
    // Find and delete the saved product
    const savedProduct = await prisma.savedProduct.findFirst({
      where: {
        userPreferenceId: userPrefs.id,
        productId
      }
    });
    
    if (!savedProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found in saved items'
      }, { status: 404 });
    }
    
    await prisma.savedProduct.delete({
      where: {
        id: savedProduct.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product removed from saved items'
    });
    
  } catch (error) {
    console.error('Error removing product from saved items', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to remove product from saved items' },
      { status: 500 }
    );
  }
}
