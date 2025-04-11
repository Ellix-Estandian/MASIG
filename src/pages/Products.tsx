
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProductSearch from "@/components/ProductSearch";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import { useProductData } from "@/hooks/useProductData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { Product } from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import AddProductModal from "@/components/AddProductModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import EditProductModal from "@/components/EditProductModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Custom hooks for data fetching
  const { loading, products, fetchProducts } = useProductData();
  const { 
    historyLoading, 
    selectedProduct, 
    selectedProductName, 
    priceHistory, 
    fetchPriceHistory 
  } = usePriceHistory();
  const { toast } = useToast();

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

  const handleEditClick = (product: Product) => {
    setSelectedProductForEdit(product);
    setEditProductOpen(true);
  };

  const handleProductUpdated = () => {
    setEditProductOpen(false);
    fetchProducts();
  };

  const handleDeleteClick = (productCode: string) => {
    setProductToDelete(productCode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      // First delete price history records associated with this product
      const { error: priceHistError } = await supabase
        .from('pricehist')
        .delete()
        .eq('prodcode', productToDelete);
      
      if (priceHistError) throw priceHistError;
      
      // Then delete the product itself
      const { error: productError } = await supabase
        .from('product')
        .delete()
        .eq('prodcode', productToDelete);
      
      if (productError) throw productError;
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted."
      });
      
      // Refresh the product list
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message || "An error occurred while deleting the product."
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <ProductSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              className="flex-1 sm:w-64"
            />
            <Button onClick={() => setAddProductOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              View and manage all your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.prodcode}>
                        <TableCell className="font-medium">{product.prodcode}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>
                          {product.current_price !== null 
                            ? `$${product.current_price.toFixed(2)}` 
                            : 'No price set'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewHistory(product.prodcode)}
                            >
                              View History
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600" 
                              onClick={() => handleDeleteClick(product.prodcode)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
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
      
      {selectedProductForEdit && (
        <EditProductModal
          open={editProductOpen}
          onOpenChange={setEditProductOpen}
          product={selectedProductForEdit}
          onProductUpdated={handleProductUpdated}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product and all its price history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Products;
