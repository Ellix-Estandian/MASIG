
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import ProductSearch from "@/components/ProductSearch";
import AddProductModal from "@/components/AddProductModal";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import { useProductData } from "@/hooks/useProductData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProductsOverview from "@/components/dashboard/ProductsOverview";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { calculateProductStats } from "@/utils/productStats";
import { Product } from "@/components/ProductTable";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
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

  const stats = calculateProductStats(products);

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
      
      <AddProductModal
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onProductAdded={fetchProducts}
      />
      
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
