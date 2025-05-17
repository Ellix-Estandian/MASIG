
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProductData } from "@/hooks/useProductData";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

const ReportsTab: React.FC = () => {
  const { products, loading } = useProductData();
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Get top 5 products with highest price increases
  const topPriceIncreases = [...products]
    .filter(p => p.price_change !== null && p.price_change > 0)
    .sort((a, b) => (b.price_change || 0) - (a.price_change || 0))
    .slice(0, 5)
    .map(p => ({ 
      name: p.description?.substring(0, 20) || p.prodcode,
      change: Number(p.price_change?.toFixed(2))
    }));

  // Get top 5 products with biggest price decreases
  const topPriceDecreases = [...products]
    .filter(p => p.price_change !== null && p.price_change < 0)
    .sort((a, b) => (a.price_change || 0) - (b.price_change || 0))
    .slice(0, 5)
    .map(p => ({ 
      name: p.description?.substring(0, 20) || p.prodcode,
      change: Number(Math.abs(p.price_change || 0).toFixed(2))
    }));

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const textColor = isDark ? "#e2e8f0" : "#334155";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/5">
          <CardTitle>Price Increase Report</CardTitle>
          <CardDescription>
            Top 5 products with highest price increases
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {topPriceIncreases.length > 0 ? (
            <div className="h-[300px] px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPriceIncreases}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis 
                    dataKey="name" 
                    stroke={textColor}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke={textColor} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#475569' : '#e2e8f0',
                      color: textColor
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar 
                    dataKey="change" 
                    fill="#10b981" 
                    name="% Price Increase" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
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

      <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/5">
          <CardTitle>Price Decrease Report</CardTitle>
          <CardDescription>
            Top 5 products with biggest price decreases
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {topPriceDecreases.length > 0 ? (
            <div className="h-[300px] px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPriceDecreases}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis 
                    dataKey="name" 
                    stroke={textColor}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke={textColor} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#475569' : '#e2e8f0',
                      color: textColor
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar 
                    dataKey="change" 
                    fill="#f43f5e" 
                    name="% Price Decrease" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
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
