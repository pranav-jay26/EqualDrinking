/**
 * API route for user's search history
 * Handles recording new searches and retrieving search history
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
 * Retrieves search history for a user
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
    console.log('Retrieving search history', { userId });
    
    // Find user preferences to get associated search history
    let userPrefs = await prisma.userPreference.findUnique({
      where: { userId },
      include: {
        searchHistory: {
          orderBy: {
            searchDate: 'desc'
          }
        }
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
          priceRangeMax: 1000
        },
        include: {
          searchHistory: true
        }
      });
    }
    
    // Format search history for the frontend
    const searchHistory = userPrefs.searchHistory.map(item => ({
      id: item.id,
      date: item.searchDate.toISOString(),
      appliance: {
        type: item.applianceType,
        brand: item.applianceBrand || '',
        model: item.applianceModel || '',
        year: item.applianceYear || ''
      },
      resultCount: item.resultCount
    }));
    
    return NextResponse.json({
      success: true,
      data: searchHistory
    });
    
  } catch (error) {
    console.error('Error retrieving search history', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve search history' },
      { status: 500 }
    );
  }
}

/**
 * POST handler
 * Records a new search to user's history
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
    const { search } = body;
    
    if (!search || !search.applianceType) {
      return NextResponse.json(
        { success: false, error: 'Search details are required' },
        { status: 400 }
      );
    }
    
    console.log('Recording search history', { userId, search });
    
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
    
    // Create the search history entry
    const searchHistory = await prisma.searchHistory.create({
      data: {
        userPreferenceId: userPrefs.id,
        searchDate: new Date(),
        applianceType: search.applianceType,
        applianceBrand: search.applianceBrand || null,
        applianceModel: search.applianceModel || null,
        applianceYear: search.applianceYear || null,
        resultCount: search.resultCount || 0
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: searchHistory.id,
        date: searchHistory.searchDate.toISOString(),
        appliance: {
          type: searchHistory.applianceType,
          brand: searchHistory.applianceBrand || '',
          model: searchHistory.applianceModel || '',
          year: searchHistory.applianceYear || ''
        },
        resultCount: searchHistory.resultCount
      }
    });
    
  } catch (error) {
    console.error('Error recording search history', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to record search history' },
      { status: 500 }
    );
  }
}
