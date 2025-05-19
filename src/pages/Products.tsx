import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProductSearch from "@/components/ProductSearch";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import { useProductData } from "@/hooks/useProductData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { Product } from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";
import { useActivityLog } from "@/hooks/useActivityLog";
import Footer from "@/components/Footer";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  
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
  const { logActivity } = useActivityLog();

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

  const handleProductClick = async (product: Product) => {
    setSelectedProductDetails(product);
    setProductDetailsOpen(true);
    
    // Log that a product was viewed
    await logActivity({
      action: "viewed",
      productCode: product.prodcode,
      productName: product.description,
    });
  };

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
    setProductDetailsOpen(false);
  };

  const handleProductUpdated = () => {
    setEditProductOpen(false);
    fetchProducts();
  };

  const handleDeleteClick = (productCode: string) => {
    setProductToDelete(productCode);
    setDeleteDialogOpen(true);
    setProductDetailsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      // Find the product being deleted to log details
      const productToLog = products.find(p => p.prodcode === productToDelete);
      
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
      
      // Log the deletion activity
      if (productToLog) {
        await logActivity({
          action: "deleted",
          productCode: productToLog.prodcode,
          productName: productToLog.description,
          details: {
            lastPrice: productToLog.current_price,
            unit: productToLog.unit
          }
        });
      }
      
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
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex-grow space-y-6">
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
              {
                loading ? (
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow 
                          key={product.prodcode}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleProductClick(product)}
                        >
                          <TableCell className="font-medium">{product.prodcode}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell>
                            {product.current_price !== null 
                              ? `$${product.current_price.toFixed(2)}` 
                              : 'No price set'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
              }
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
      
      {
        selectedProductDetails && (
        <Dialog open={productDetailsOpen} onOpenChange={setProductDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
              <DialogDescription>
                Details for {selectedProductDetails.prodcode}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div>
                <h4 className="text-sm font-medium">Product Code</h4>
                <p className="text-sm">{selectedProductDetails.prodcode}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm">{selectedProductDetails.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Unit</h4>
                <p className="text-sm">{selectedProductDetails.unit}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Current Price</h4>
                <p className="text-sm">
                  {selectedProductDetails.current_price !== null 
                    ? `$${selectedProductDetails.current_price.toFixed(2)}` 
                    : 'No price set'}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleViewHistory(selectedProductDetails.prodcode)}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                View Price History
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleEditClick(selectedProductDetails)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteClick(selectedProductDetails.prodcode)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      }
      
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
