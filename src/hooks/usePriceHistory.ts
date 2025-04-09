
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PriceHistory } from "@/types/product";

interface RPCError {
  message: string;
}

export const usePriceHistory = () => {
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const { toast } = useToast();

  const fetchPriceHistory = async (productCode: string) => {
    setHistoryLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("description")
        .eq("prodcode", productCode)
        .single();
      
      if (productError) throw productError;
      
      setSelectedProductName(productData?.description || "");
      
      const { data, error } = await supabase
        .from("pricehist")
        .select("*")
        .eq("prodcode", productCode)
        .order("effdate", { ascending: false });
      
      if (error) throw error;
      
      setPriceHistory(data || []);
      setSelectedProduct(productCode);
      return true;
    } catch (error: any) {
      console.error("Error fetching price history:", error);
      toast({
        variant: "destructive",
        title: "Error fetching price history",
        description: error.message || "An error occurred while fetching price history",
      });
      return false;
    } finally {
      setHistoryLoading(false);
    }
  };

  return {
    historyLoading,
    selectedProduct,
    selectedProductName,
    priceHistory,
    fetchPriceHistory
  };
};
