
import React from "react";
import { ArrowUp, ArrowDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Product {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number | null;
  price_change: number | null;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onViewHistory: (productCode: string) => void;
}

const ProductTable = ({ products, loading, onViewHistory }: ProductTableProps) => {
  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-sm text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Change</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
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
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onViewHistory(product.prodcode)}
              >
                <History className="h-4 w-4 mr-1" />
                View History
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
