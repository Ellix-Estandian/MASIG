
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import { useProductData } from "@/hooks/useProductData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProductsOverview from "@/components/dashboard/ProductsOverview";
import { calculateProductStats } from "@/utils/productStats";
import { Product } from "@/components/ProductTable";
import AddProductModal from "@/components/AddProductModal";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 5;
  
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
    // Reset to first page when search results change
    setCurrentPage(0);
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Get current page products
  const currentProducts = filteredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <DashboardStats stats={stats} />
            <ProductsOverview 
              products={currentProducts}
              loading={loading}
              onViewHistory={handleViewHistory}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
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
