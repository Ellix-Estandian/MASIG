
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/ProductTable";
import { Product } from "@/components/ProductTable";

interface ProductsOverviewProps {
  products: Product[];
  loading: boolean;
  onViewHistory: (productCode: string) => void;
}

const ProductsOverview: React.FC<ProductsOverviewProps> = ({
  products,
  loading,
  onViewHistory,
}) => {
  return (
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
              products={products}
              loading={loading}
              onViewHistory={onViewHistory}
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
  );
};

export default ProductsOverview;
