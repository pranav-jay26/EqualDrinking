"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';

// Common vendors for appliance shopping
const COMMON_VENDORS = [
  'Amazon',
  'Home Depot',
  'Lowe\'s',
  'Best Buy',
  'Walmart',
  'Costco',
  'Wayfair',
];

export default function PreferencesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // User preferences state
  const [preferWaterEfficiency, setPreferWaterEfficiency] = useState(true);
  const [preferEnergyEfficiency, setPreferEnergyEfficiency] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [preferredVendors, setPreferredVendors] = useState<string[]>(['Amazon', 'Home Depot']);
  
  // Fetch user preferences when component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserPreferences();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);
  
  // Fetch user preferences from API
  const fetchUserPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user preferences');
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.preferences) {
        const { preferences } = data.data;
        setPreferWaterEfficiency(preferences.preferWaterEfficiency ?? true);
        setPreferEnergyEfficiency(preferences.preferEnergyEfficiency ?? true);
        setPriceRange([preferences.priceRange?.min ?? 0, preferences.priceRange?.max ?? 1000]);
        setPreferredVendors(preferences.preferredVendors ?? ['Amazon', 'Home Depot']);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast.error('Failed to load your preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save user preferences
  const savePreferences = async () => {
    if (!isSignedIn) {
      toast.error('You must be signed in to save preferences');
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            preferWaterEfficiency,
            preferEnergyEfficiency,
            priceRange: {
              min: priceRange[0],
              max: priceRange[1]
            },
            preferredVendors
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save your preferences');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle vendor selection
  const toggleVendor = (vendor: string) => {
    setPreferredVendors(prev => {
      if (prev.includes(vendor)) {
        return prev.filter(v => v !== vendor);
      } else {
        return [...prev, vendor];
      }
    });
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
          <h1 className="text-3xl font-bold mb-4">Sign in to access preferences</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to be signed in to customize your preferences.
          </p>
          <Button asChild>
            <a href="/sign-in">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mt-6">Your Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your shopping and search preferences
          </p>
        </header>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Efficiency Preferences</CardTitle>
            <CardDescription>
              Set your priorities for water and energy efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="water-efficiency">Prefer Water Efficient Products</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize products with WaterSense certification or lower water consumption
                </p>
              </div>
              <Switch
                id="water-efficiency"
                checked={preferWaterEfficiency}
                onCheckedChange={setPreferWaterEfficiency}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="energy-efficiency">Prefer Energy Efficient Products</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize products with ENERGY STAR certification or lower energy consumption
                </p>
              </div>
              <Switch
                id="energy-efficiency"
                checked={preferEnergyEfficiency}
                onCheckedChange={setPreferEnergyEfficiency}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Price Range</CardTitle>
            <CardDescription>
              Set your preferred price range for appliances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <Slider
                value={priceRange}
                min={0}
                max={2000}
                step={50}
                onValueChange={setPriceRange}
              />
              <div className="flex justify-between">
                <p className="text-sm font-medium">${priceRange[0]}</p>
                <p className="text-sm font-medium">${priceRange[1]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preferred Vendors</CardTitle>
            <CardDescription>
              Select your preferred stores for shopping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {COMMON_VENDORS.map(vendor => (
                <div key={vendor} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`vendor-${vendor}`} 
                    checked={preferredVendors.includes(vendor)}
                    onCheckedChange={() => toggleVendor(vendor)}
                  />
                  <Label htmlFor={`vendor-${vendor}`}>{vendor}</Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={savePreferences} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
