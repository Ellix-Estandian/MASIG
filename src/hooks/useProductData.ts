
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/components/ProductTable";

export const useProductData = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching products...");
      
      // Get all products
      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("*");
      
      if (productError) {
        console.error("Error fetching products:", productError);
        throw productError;
      }
      
      // Process the product data to add price information
      const productsWithPriceInfo: Product[] = await Promise.all(
        productData.map(async (product) => {
          // Get the latest price for this product
          const { data: latestPriceData, error: latestPriceError } = await supabase
            .from("pricehist")
            .select("*")
            .eq("prodcode", product.prodcode)
            .order("effdate", { ascending: false })
            .limit(1);
          
          if (latestPriceError) {
            console.error(`Error fetching latest price for ${product.prodcode}:`, latestPriceError);
            throw latestPriceError;
          }
          
          // Get the previous price for this product (if any)
          const { data: previousPriceData, error: previousPriceError } = await supabase
            .from("pricehist")
            .select("*")
            .eq("prodcode", product.prodcode)
            .order("effdate", { ascending: false })
            .range(1, 1); // Skip the first one (latest) and get the second one
          
          if (previousPriceError) {
            console.error(`Error fetching previous price for ${product.prodcode}:`, previousPriceError);
            throw previousPriceError;
          }
          
          const currentPrice = latestPriceData && latestPriceData.length > 0 
            ? latestPriceData[0].unitprice 
            : null;
            
          const previousPrice = previousPriceData && previousPriceData.length > 0 
            ? previousPriceData[0].unitprice 
            : null;
          
          // Calculate price change percentage if both prices exist
          let priceChange = null;
          if (currentPrice !== null && previousPrice !== null && previousPrice !== 0) {
            priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
          }
          
          return {
            ...product,
            current_price: currentPrice,
            price_change: priceChange
          };
        })
      );
      
      console.log("Products fetched successfully:", productsWithPriceInfo);
      setProducts(productsWithPriceInfo);
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

  useEffect(() => {
    fetchProducts();
    
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
