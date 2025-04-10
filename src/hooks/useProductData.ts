
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
      console.log("Fetching products...");
      
      // Use a type assertion to override TypeScript's type checking for the RPC call
      const { data, error } = await supabase.rpc('get_products_with_price_info') as unknown as ProductsWithPriceInfo;
      
      if (error) {
        console.error("Error in get_products_with_price_info:", error);
        throw error;
      }
      
      console.log("Products fetched successfully:", data);
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
      console.log("Initializing function...");
      
      // Try to call the function to check if it exists
      const { error } = await supabase.rpc('get_products_with_price_info') as unknown as ProductsWithPriceInfo;
      
      if (error && error.message.includes('function get_products_with_price_info() does not exist')) {
        console.log("Function doesn't exist, creating it...");
        
        // Function doesn't exist, so invoke the Edge Function
        const { error: invokeError } = await supabase.functions.invoke('create_price_info_function', {
          method: 'POST',
        });
        
        if (invokeError) {
          console.error("Error invoking create_price_info_function:", invokeError);
          throw new Error(`Failed to create price info function: ${invokeError.message}`);
        }
        
        console.log("Function created, fetching products...");
        
        // Wait a bit for the function to be created
        setTimeout(async () => {
          await fetchProducts();
        }, 1000);
      } else if (error) {
        // Another error occurred
        console.error("Error checking function existence:", error);
        throw error;
      } else {
        // Function exists, just fetch products
        console.log("Function exists, fetching products...");
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
    
    // Set up a subscription to pricehist table for real-time updates
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pricehist'
        },
        () => {
          // When any change happens to pricehist, refresh products
          fetchProducts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    loading,
    products,
    fetchProducts
  };
};
