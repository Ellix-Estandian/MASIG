
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/components/ProductTable";

export const useProductData = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  // Properly type the RPC function return
  interface ProductsWithPriceInfo {
    data: Product[] | null;
    error: { message: string } | null;
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Explicitly type the RPC call
      const { data, error } = await supabase.rpc('get_products_with_price_info') as ProductsWithPriceInfo;
      
      if (error) throw error;
      
      setProducts(data || []);
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

  // Properly type the function call
  const initializeFunction = async () => {
    try {
      const { error } = await supabase.rpc('get_products_with_price_info') as ProductsWithPriceInfo;
      
      if (error && error.message.includes('function get_products_with_price_info() does not exist')) {
        const createResult = await supabase.rpc('create_price_info_function') as {
          data: any;
          error: { message: string } | null;
        };
        
        if (createResult.error) {
          console.error("Error creating function:", createResult.error);
          fetchProducts();
        } else {
          fetchProducts();
        }
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error checking function:", error);
      fetchProducts();
    }
  };

  useEffect(() => {
    initializeFunction();
  }, []);

  return {
    loading,
    products,
    fetchProducts
  };
};
