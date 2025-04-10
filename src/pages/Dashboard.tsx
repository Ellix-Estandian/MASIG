
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProductSearch from "@/components/ProductSearch";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import { useProductData } from "@/hooks/useProductData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProductsOverview from "@/components/dashboard/ProductsOverview";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { calculateProductStats } from "@/utils/productStats";
import { Product } from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddProductModal from "@/components/AddProductModal";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  
  // Custom hooks for data fetching
  const { loading, products, fetchProducts } = useProductData();
  const { 
    historyLoading, 
    selectedProduct, 
    selectedProductName, 
    priceHistory, 
    fetchPriceHistory 
  } = usePriceHistory();

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

  const handleViewHistory = async (productCode: string) => {
    const success = await fetchPriceHistory(productCode);
    if (success) {
      setHistoryOpen(true);
    }
  };

  const handleProductAdded = () => {
    setAddProductOpen(false);
    fetchProducts();
  };

  const stats = calculateProductStats(products);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <ProductSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Button onClick={() => setAddProductOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
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
            <DashboardStats stats={stats} />
            <ProductsOverview 
              products={filteredProducts}
              loading={loading}
              onViewHistory={handleViewHistory}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
      
      <PriceHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        productCode={selectedProduct || ""}
        productName={selectedProductName || ""}
        priceHistory={priceHistory}
        loading={historyLoading}
      />
      
      <AddProductModal
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onProductAdded={handleProductAdded}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
