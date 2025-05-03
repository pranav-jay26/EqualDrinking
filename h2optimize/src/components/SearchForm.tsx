"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Droplet } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const APPLIANCE_TYPES = [
  "Dishwasher", 
  "Faucet", 
  "Shower", 
  "Washing Machine", 
  "Toilet",
  "Refrigerator",
  "Water Heater"
];

export function SearchForm() {
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type) {
      toast.error("Please select an appliance type");
      return;
    }

    // Allow searching with just the type, with a helpful message if other fields are missing
    if (!brand && !model) {
      toast.info("For more accurate results, consider adding brand and model information");
    }
    
    setIsLoading(true);
    
    try {
      // If user is signed in, save search to history
      if (isSignedIn) {
        // Create a search history record
        try {
          await fetch('/api/user/search-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              search: {
                applianceType: type,
                applianceBrand: brand,
                applianceModel: model,
                applianceYear: year,
                resultCount: 0, // This will be updated when results are fetched
              }
            }),
          });
        } catch (error) {
          // Don't block the search if saving history fails
          console.error('Error saving search history:', error);
        }
      }
      
      // Navigate to results page
      router.push(`/results?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand || '')}&model=${encodeURIComponent(model || '')}&year=${encodeURIComponent(year || '')}`);
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('An error occurred during search');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-5">
      <div className="space-y-3">
        <Label htmlFor="type" className="text-sm font-medium">
          Appliance Type <span className="text-red-500">*</span>
        </Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type" className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary">
            <SelectValue placeholder="Select appliance type..." />
          </SelectTrigger>
          <SelectContent>
            {APPLIANCE_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="brand" className="text-sm font-medium">
          Make/Brand
        </Label>
        <Input 
          id="brand" 
          value={brand} 
          onChange={(e) => setBrand(e.target.value)} 
          placeholder="e.g., GE, Whirlpool, Moen" 
          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="model" className="text-sm font-medium">
          Model
        </Label>
        <Input 
          id="model" 
          value={model} 
          onChange={(e) => setModel(e.target.value)} 
          placeholder="e.g., Profile 1234, AquaSense 5000" 
          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="year" className="text-sm font-medium">
          Year (Optional)
        </Label>
        <Input 
          id="year" 
          type="number" 
          value={year} 
          onChange={(e) => setYear(e.target.value)} 
          placeholder="e.g., 2015" 
          min="1970"
          max="2025"
          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2" 
        disabled={isLoading || !type}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            <span>Find Efficient Alternatives</span>
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-center mt-4">
        <Droplet className="h-4 w-4 text-blue-500 mr-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Powered by ENERGY STAR and WaterSense data
        </span>
      </div>
    </form>
  );
}
