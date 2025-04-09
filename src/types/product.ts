
export interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number;
}

export interface ProductStats {
  totalProducts: number;
  priceIncreases: number;
  priceDecreases: number;
  avgChange: number;
}
