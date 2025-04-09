
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUp, ArrowDown, Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductSearch from "@/components/ProductSearch";
import ProductTable, { Product } from "@/components/ProductTable";
import AddProductModal from "@/components/AddProductModal";
import PriceHistoryModal from "@/components/PriceHistoryModal";

export interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toast } = useToast();

  // Fetch products with their latest price and percentage change
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_products_with_price_info');
      
      if (error) throw error;
      
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error fetching products",
        description: error.message || "An error occurred while fetching products",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch price history for a specific product
  const fetchPriceHistory = async (productCode: string) => {
    setHistoryLoading(true);
    try {
      // Get product details
      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("description")
        .eq("prodcode", productCode)
        .single();
      
      if (productError) throw productError;
      
      setSelectedProductName(productData?.description || "");
      
      // Get price history
      const { data, error } = await supabase
        .from("pricehist")
        .select("*")
        .eq("prodcode", productCode)
        .order("effdate", { ascending: false });
      
      if (error) throw error;
      
      setPriceHistory(data || []);
      setHistoryOpen(true);
    } catch (error: any) {
      console.error("Error fetching price history:", error);
      toast({
        variant: "destructive",
        title: "Error fetching price history",
        description: error.message || "An error occurred while fetching price history",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.prodcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Initial fetch
  useEffect(() => {
    // Create SQL function if it doesn't exist
    const createSQLFunction = async () => {
      try {
        const { error } = await supabase.rpc('get_products_with_price_info');
        
        // If the function doesn't exist, we'll get an error
        if (error && error.message.includes('function get_products_with_price_info() does not exist')) {
          // Function doesn't exist, create it
          const { error: createError } = await supabase.rpc('create_price_info_function');
          
          if (createError) {
            console.error("Error creating function:", createError);
            // Fallback to fetching products manually
            fetchProducts();
          } else {
            // Function created, fetch products
            fetchProducts();
          }
        } else {
          // Function exists, fetch products
          fetchProducts();
        }
      } catch (error) {
        console.error("Error checking function:", error);
        // Fallback to fetching products manually
        fetchProducts();
      }
    };
    
    createSQLFunction();
  }, []);

  const handleViewHistory = (productCode: string) => {
    setSelectedProduct(productCode);
    fetchPriceHistory(productCode);
  };

  const getStats = () => {
    const totalProducts = products.length;
    const priceIncreases = products.filter(p => p.price_change !== null && p.price_change > 0).length;
    const priceDecreases = products.filter(p => p.price_change !== null && p.price_change < 0).length;
    
    // Calculate average price change
    let totalChange = 0;
    let changeCount = 0;
    
    products.forEach(product => {
      if (product.price_change !== null) {
        totalChange += product.price_change;
        changeCount++;
      }
    });
    
    const avgChange = changeCount > 0 ? totalChange / changeCount : 0;
    
    return {
      totalProducts,
      priceIncreases,
      priceDecreases,
      avgChange
    };
  };

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <ProductSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Button 
            onClick={() => setAddProductOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    In inventory
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Price Increases
                  </CardTitle>
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.priceIncreases}</div>
                  <p className="text-xs text-muted-foreground">
                    Products with price increases
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Price Decreases
                  </CardTitle>
                  <ArrowDown className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.priceDecreases}</div>
                  <p className="text-xs text-muted-foreground">
                    Products with price decreases
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Price Change
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgChange > 0 ? "+" : ""}
                    {stats.avgChange.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall price trend
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  View and manage your product prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <ProductTable 
                      products={filteredProducts}
                      loading={loading}
                      onViewHistory={handleViewHistory}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="h-[400px] flex items-center justify-center text-muted-foreground">
            Analytics content coming soon
          </TabsContent>
          <TabsContent value="reports" className="h-[400px] flex items-center justify-center text-muted-foreground">
            Reports content coming soon
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Product Modal */}
      <AddProductModal
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onProductAdded={fetchProducts}
      />
      
      {/* Price History Modal */}
      <PriceHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        productCode={selectedProduct || ""}
        productName={selectedProductName || ""}
        priceHistory={priceHistory}
        loading={historyLoading}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
