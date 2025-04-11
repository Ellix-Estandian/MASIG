
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/components/ProductTable";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ProductsOverviewProps {
  products: Product[];
  loading: boolean;
  onViewHistory: (productCode: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

const ProductsOverview: React.FC<ProductsOverviewProps> = ({
  products,
  loading,
  onViewHistory,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          View your product prices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border mb-4">
          <div className="relative w-full overflow-auto">
            {loading ? (
              <div className="w-full py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="w-full py-8 text-center">
                <p className="text-sm text-gray-500">No products found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow 
                      key={product.prodcode} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewHistory(product.prodcode)}
                    >
                      <TableCell className="font-medium">{product.prodcode}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        {product.current_price !== null 
                          ? `$${product.current_price.toFixed(2)}` 
                          : 'No price set'}
                      </TableCell>
                      <TableCell>
                        {product.price_change !== null ? (
                          <div className="flex items-center">
                            {product.price_change > 0 ? (
                              <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                            ) : product.price_change < 0 ? (
                              <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                            ) : (
                              <span className="mr-5"></span>
                            )}
                            <span
                              className={
                                product.price_change > 0
                                  ? "text-emerald-500"
                                  : product.price_change < 0
                                  ? "text-rose-500"
                                  : ""
                              }
                            >
                              {product.price_change > 0 ? "+" : ""}
                              {product.price_change === 0
                                ? "0.0%"
                                : product.price_change.toFixed(1) + "%"}
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        {!loading && products.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousPage();
                  }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              <PaginationItem>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
              </PaginationItem>
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsOverview;
