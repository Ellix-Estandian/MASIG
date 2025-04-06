
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="flex-1 bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                <Package className="text-brand-700 h-6 w-6" />
              </div>
              <span className="text-xl font-bold">InventoryPro</span>
            </div>
            <div className="hidden md:flex space-x-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-brand-600">Features</Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-brand-600">Pricing</Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-brand-600">About</Button>
            </div>
            <div className="flex space-x-4">
              <Button 
                className="bg-white text-brand-700 hover:bg-gray-100"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </Button>
            </div>
          </nav>

          <div className="mt-16 md:mt-24 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Manage Your Inventory & Track Price Changes
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-brand-50">
              A powerful inventory management system that helps you keep track of products and monitor price history over time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-brand-700 hover:bg-gray-100"
                onClick={() => navigate("/signup")}
              >
                Get started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-brand-600"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful features for your business
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your inventory and track price changes over time.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-brand-100 rounded-md flex items-center justify-center">
                <Package className="text-brand-700 h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Product Management</h3>
              <p className="mt-2 text-gray-600">
                Easily add, edit, and manage your entire product catalog in one place.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-brand-100 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Price History Tracking</h3>
              <p className="mt-2 text-gray-600">
                Monitor and analyze price changes over time to optimize your pricing strategy.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-brand-100 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Detailed Reports</h3>
              <p className="mt-2 text-gray-600">
                Generate comprehensive reports on inventory levels and price trends.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              className="bg-brand-600 hover:bg-brand-700"
              onClick={() => navigate("/signup")}
            >
              Get started for free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
