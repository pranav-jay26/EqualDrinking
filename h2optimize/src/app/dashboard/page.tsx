"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard, ProductRecommendation } from '@/components/ProductCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';

// Search history type
interface SearchHistoryItem {
  id: string;
  date: string;
  appliance: {
    type: string;
    brand: string;
    model: string;
    year: string;
  };
  resultCount: number;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [savedProducts, setSavedProducts] = useState<ProductRecommendation[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user data when component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserData();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);
  
  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      try {
        // Fetch user preferences including saved products and search history
        const response = await fetch('/api/user/preferences');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setSavedProducts(data.data.savedProducts || []);
          setSearchHistory(data.data.searchHistory || []);
        } else {
          // If the API returns success:false or no data, use empty arrays
          setSavedProducts([]);
          setSearchHistory([]);
          console.warn('API returned no data or success:false', data);
        }
      } catch (fetchError) {
        console.error('Error fetching from API:', fetchError);
        toast.error('Could not load your dashboard data. Using default data.');
        
        // Use empty arrays as fallback
        setSavedProducts([]);
        setSearchHistory([]);
      }
      
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      toast.error('Failed to load your dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle removing a saved product
  const handleRemoveSavedProduct = async (product: ProductRecommendation) => {
    // The product card component handles the API call itself
    // We just need to update the local state here
    setSavedProducts(prev => prev.filter(p => p.id !== product.id));
  };
  
  // Handle re-running a search
  const handleRerunSearch = (searchId: string) => {
    const search = searchHistory.find(s => s.id === searchId);
    if (search) {
      const { type, brand, model, year } = search.appliance;
      // Navigate to the results page with the search parameters
      window.location.href = `/results?type=${type}&brand=${brand}&model=${model}&year=${year}`;
    }
  };
  
  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Redirect if not signed in (handled by middleware, but this is a fallback)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center mt-20">
          <h1 className="text-3xl font-bold mb-4">Sign in to view your dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to be signed in to view your saved items and search history.
          </p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mt-6">
            {user ? `${user.firstName || 'Your'}'s Dashboard` : 'Your Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your saved appliance recommendations and search history
          </p>
        </header>
        
        <main>
          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="saved">Saved Items ({savedProducts.length})</TabsTrigger>
              <TabsTrigger value="history">Search History ({searchHistory.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="saved">
              {savedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSave={handleRemoveSavedProduct}
                      isSaved={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-2">No saved items yet</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    When you save an item from search results, it will appear here.
                  </p>
                  <Button asChild>
                    <Link href="/">Start a New Search</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {searchHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {searchHistory.map(search => (
                    <Card key={search.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{search.appliance.brand} {search.appliance.type}</CardTitle>
                            <CardDescription>
                              Model: {search.appliance.model} ({search.appliance.year}) • 
                              Searched on {new Date(search.date).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {search.resultCount} results
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => handleRerunSearch(search.id)}
                          variant="outline"
                          size="sm"
                        >
                          View Results Again
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-2">No search history yet</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your search history will appear here once you perform searches.
                  </p>
                  <Button asChild>
                    <Link href="/">Start Your First Search</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
