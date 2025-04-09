
import { Product } from "@/components/ProductTable";
import { ProductStats } from "@/types/product";

export const calculateProductStats = (products: Product[]): ProductStats => {
  const totalProducts = products.length;
  const priceIncreases = products.filter(p => p.price_change !== null && p.price_change > 0).length;
  const priceDecreases = products.filter(p => p.price_change !== null && p.price_change < 0).length;
  
  let totalChange = 0;
  let changeCount = 0;
  
  products.forEach(product => {
    if (product.price_change !== null) {
      totalChange += product.price_change;
      changeCount++;
    }
  });
  
  const avgChange = changeCount > 0 ? totalChange / changeCount : 0;
  
  return {
    totalProducts,
    priceIncreases,
    priceDecreases,
    avgChange
  };
};
