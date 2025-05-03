"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard, ProductRecommendation } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { ArrowLeft, Filter } from 'lucide-react';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user } = useUser();
  
  // Extract search parameters
  const type = searchParams.get('type') || '';
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';
  
  // Fetch recommendations from the API
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        
        // Build the query string for the API call
        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type);
        if (brand) queryParams.append('brand', brand);
        if (model) queryParams.append('model', model);
        if (year) queryParams.append('year', year);
        
        const response = await fetch(`/api/recommendations?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data.data || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [type, brand, model, year]);
  
  // Fetch user's saved products if they're signed in
  useEffect(() => {
    async function fetchSavedProducts() {
      if (!isSignedIn) return;
      
      try {
        const response = await fetch('/api/user/saved-products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch saved products');
        }
        
        const data = await response.json();
        // Extract just the IDs for checking if a product is saved
        setSavedItems(data.data.map((product: ProductRecommendation) => product.id));
      } catch (error) {
        console.error('Error fetching saved products:', error);
      }
    }
    
    fetchSavedProducts();
  }, [isSignedIn]);
  
  // Handle saving a product
  const handleSaveProduct = async (product: ProductRecommendation) => {
    if (!isSignedIn) {
      toast.error('Please sign in to save products');
      return;
    }
    
    try {
      if (savedItems.includes(product.id)) {
        // Unsave product
        const response = await fetch(`/api/user/saved-products?productId=${product.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove product from saved items');
        }
        
        setSavedItems(prev => prev.filter(id => id !== product.id));
        toast.success('Product removed from saved items');
      } else {
        // Save product
        const response = await fetch('/api/user/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save product');
        }
        
        setSavedItems(prev => [...prev, product.id]);
        toast.success('Product saved successfully');
      }
    } catch (error) {
      console.error('Error saving/unsaving product:', error);
      toast.error('Failed to update saved items');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <main>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="group hover:bg-blue-100 dark:hover:bg-blue-900">
                    <Link href="/" className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
                      <span>Back to Search</span>
                    </Link>
                  </Button>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Recommended Replacements{' '}
                  <span className="text-blue-600 dark:text-blue-400">
                    for your {year} {brand} {type}
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  We found {recommendations.length} more efficient alternatives to your {model} model.
                </p>
              </div>
              
              {isSignedIn && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow"
                  asChild
                >
                  <Link href="/preferences">
                    <Filter className="h-4 w-4" />
                    <span>Customize Preferences</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Searching for efficient alternatives...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Analyzing data from ENERGY STAR and WaterSense</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSave={handleSaveProduct}
                  isSaved={savedItems.includes(product.id)}
                />
              ))}
            </div>
          )}
          
          {!loading && recommendations.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No recommendations found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                We couldn't find any more efficient alternatives for your appliance. Try searching for a different model or adjusting your search criteria.
              </p>
              <Button asChild size="lg" className="px-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800">
                <Link href="/">Try Another Search</Link>
              </Button>
            </div>
          )}
          
          {!loading && recommendations.length > 0 && (
            <div className="mt-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {isSignedIn ? 
                  "Save your favorite products to compare them later in your dashboard." :
                  "Sign in to save your favorite products and get personalized recommendations."}
              </p>
              {!isSignedIn && (
                <Button asChild variant="outline" className="mt-2">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
