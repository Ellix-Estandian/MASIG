
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProductData } from "@/hooks/useProductData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ReportsTab: React.FC = () => {
  const { products, loading } = useProductData();

  // Get top 5 products with highest price increases
  const topPriceIncreases = [...products]
    .filter(p => p.price_change !== null && p.price_change > 0)
    .sort((a, b) => (b.price_change || 0) - (a.price_change || 0))
    .slice(0, 5)
    .map(p => ({ 
      name: p.description || p.prodcode,
      change: Number(p.price_change?.toFixed(2))
    }));

  // Get top 5 products with biggest price decreases
  const topPriceDecreases = [...products]
    .filter(p => p.price_change !== null && p.price_change < 0)
    .sort((a, b) => (a.price_change || 0) - (b.price_change || 0))
    .slice(0, 5)
    .map(p => ({ 
      name: p.description || p.prodcode,
      change: Number(p.price_change?.toFixed(2))
    }));

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Loading reports data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Increase Report</CardTitle>
          <CardDescription>
            Top 5 products with highest price increases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topPriceIncreases.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPriceIncreases}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="change" fill="#10b981" name="% Increase" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No price increases to display
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Decrease Report</CardTitle>
          <CardDescription>
            Top 5 products with biggest price decreases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topPriceDecreases.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPriceDecreases}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="change" fill="#f43f5e" name="% Decrease" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No price decreases to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
