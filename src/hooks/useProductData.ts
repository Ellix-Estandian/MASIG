
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
      const { data, error } = await supabase.rpc('get_products_with_price_info') as unknown as ProductsWithPriceInfo;
      
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

  // Create the function if it doesn't exist, then fetch products
  const initializeFunction = async () => {
    try {
      // Try to call the function to check if it exists
      const { error } = await supabase.rpc('get_products_with_price_info') as unknown as ProductsWithPriceInfo;
      
      if (error && error.message.includes('function get_products_with_price_info() does not exist')) {
        // Function doesn't exist, so invoke the Edge Function
        const { error: invokeError } = await supabase.functions.invoke('create_price_info_function', {
          method: 'POST',
        });
        
        if (invokeError) {
          throw new Error(`Failed to create price info function: ${invokeError.message}`);
        }
        
        // After creating, fetch products
        await fetchProducts();
      } else {
        // Function exists, just fetch products
        await fetchProducts();
      }
    } catch (error: any) {
      console.error("Error initializing:", error);
      toast({
        variant: "destructive",
        title: "Error initializing data",
        description: error.message || "An error occurred while setting up the application",
      });
      setLoading(false);
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
