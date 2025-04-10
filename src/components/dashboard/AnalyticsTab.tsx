
import React from "react";
import { useProductData } from "@/hooks/useProductData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const AnalyticsTab: React.FC = () => {
  const { products, loading } = useProductData();

  // Group products by unit
  const unitCounts = products.reduce((acc: { [key: string]: number }, product) => {
    const unit = product.unit || "Unknown";
    acc[unit] = (acc[unit] || 0) + 1;
    return acc;
  }, {});

  const unitData = Object.entries(unitCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Create price distribution data
  const priceRanges = {
    "< $10": 0,
    "$10 - $50": 0,
    "$50 - $100": 0,
    "$100 - $500": 0,
    "> $500": 0,
  };

  products.forEach((product) => {
    const price = product.current_price || 0;
    if (price < 10) priceRanges["< $10"]++;
    else if (price < 50) priceRanges["$10 - $50"]++;
    else if (price < 100) priceRanges["$50 - $100"]++;
    else if (price < 500) priceRanges["$100 - $500"]++;
    else priceRanges["> $500"]++;
  });

  const priceDistributionData = Object.entries(priceRanges).map(([name, value]) => ({
    name,
    value,
  }));

  // Price trends - for simulation, just using index as month
  const priceTrendData = products
    .filter((p) => p.current_price !== null)
    .slice(0, 12)
    .map((product, index) => ({
      name: product.prodcode,
      price: product.current_price,
      month: `Month ${index + 1}`,
    }));

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Loading analytics data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Units Distribution</CardTitle>
            <CardDescription>
              Distribution of products by unit type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {unitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
            <CardDescription>
              Distribution of products by price range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Price Trends</CardTitle>
          <CardDescription>
            Overview of product prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceTrendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
