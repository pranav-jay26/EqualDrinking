"use client";

import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Heart, Droplets, ZapIcon, CheckCircle, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the product recommendation type
export type ProductRecommendation = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  energyStar: boolean;
  waterSense: boolean;
  energyUse?: number;
  waterUse?: number;
  priceListings: {
    vendor: string;
    price: number;
    url: string;
  }[];
  imageUrl?: string;
  efficiencyScore?: number;
  savingEstimate?: string;
};

interface ProductCardProps {
  product: ProductRecommendation;
  onSave: (product: ProductRecommendation) => void;
  isSaved?: boolean;
}

export function ProductCard({ product, onSave, isSaved = false }: ProductCardProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [saving, setSaving] = useState(false);
  
  // Find the cheapest price listing
  const cheapestListing = product.priceListings.length > 0
    ? product.priceListings.reduce((min, listing) => 
        listing.price < min.price ? listing : min
      , product.priceListings[0])
    : null;

  // Handle saving/unsaving products
  const handleSaveProduct = async () => {
    if (!isLoaded || !isSignedIn) {
      toast.error("Please sign in to save products");
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        // Call the API to unsave the product
        const response = await fetch(`/api/user/saved-products?productId=${product.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from saved items');
        }
        
        toast.success("Product removed from saved items");
      } else {
        // Call the API to save the product
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
        
        toast.success("Product saved successfully");
      }
      
      // Call the parent component's onSave callback
      onSave(product);
      
    } catch (error) {
      console.error('Error saving/unsaving product:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="relative">
        {(product.energyStar || product.waterSense) && (
          <div className="absolute top-2 left-2 z-10 flex space-x-1">
            {product.energyStar && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1 shadow-sm">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs">ENERGY STAR</span>
              </Badge>
            )}
            {product.waterSense && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 flex items-center gap-1 shadow-sm">
                <Droplets className="h-3 w-3" />
                <span className="text-xs">WaterSense</span>
              </Badge>
            )}
          </div>
        )}
        
        {product.imageUrl ? (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No image available</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div>
          <CardTitle className="line-clamp-2 text-gray-900 dark:text-white">{product.name}</CardTitle>
          <CardDescription className="flex justify-between items-center mt-1">
            <span className="font-medium text-gray-600 dark:text-gray-300">{product.brand}</span>
            {cheapestListing && (
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${cheapestListing.price.toFixed(2)}
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="space-y-3">
          <p className="text-sm flex justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span> 
            <span className="text-gray-600 dark:text-gray-400">{product.model}</span>
          </p>
          
          {product.energyUse !== undefined && (
            <p className="text-sm flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <ZapIcon className="h-3.5 w-3.5 text-yellow-500" /> Energy:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {product.energyUse} kWh/year
              </span>
            </p>
          )}
          
          {product.waterUse !== undefined && (
            <p className="text-sm flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-500" /> Water:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {product.waterUse} gal/use
              </span>
            </p>
          )}
          
          {product.efficiencyScore !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Efficiency:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Star 
                    key={score}
                    className={`h-4 w-4 ${score <= Math.round(product.efficiencyScore || 0) 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {product.savingEstimate && (
            <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Estimated savings: {product.savingEstimate}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 pt-4">
        <Button 
          asChild 
          variant="outline" 
          className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <a 
            href={cheapestListing?.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Buy Now</span>
          </a>
        </Button>
        
        <Button 
          onClick={handleSaveProduct} 
          variant={isSaved ? "secondary" : "default"}
          className={`flex-1 flex items-center justify-center gap-1.5 ${isSaved 
            ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50' 
            : 'bg-primary hover:bg-primary/90'}`}
          disabled={saving}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          <span>{saving ? "Processing..." : (isSaved ? "Saved" : "Save")}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
