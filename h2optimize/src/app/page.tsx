import { SearchForm } from "@/components/SearchForm";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Droplets, Zap, Save } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="mb-12 text-center py-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">H2Optimize</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Find water and energy-efficient replacements for your appliances and save money on utilities.
          </p>
        </header>
        
        <main className="flex flex-col items-center justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Find Efficient Replacements</h2>
              <SearchForm />
            </div>
          </div>
          
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Enter Your Appliance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply enter details about your current appliance, including type, brand, model, and year of manufacture.
                </p>
              </div>
              
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <div className="flex">
                      <Droplets className="w-6 h-6 text-blue-500 mr-1" />
                      <Zap className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Get Recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI finds efficient alternatives from trusted retailers with data from ENERGY STAR and WaterSense.
                </p>
              </div>
              
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Save className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Save & Compare</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Save your favorite recommendations to your dashboard and compare prices across retailers.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="mt-20 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p> 2025 H2Optimize. All rights reserved.</p>
          <p className="mt-2">Helping you save water, energy, and money.</p>
        </footer>
      </div>
    </div>
  );
}
