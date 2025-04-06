
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";

// This will be replaced with actual data from Supabase
const mockProducts = [
  { id: "1", code: "P001", description: "Premium Laptop", unit: "pc", currentPrice: 1299.99, priceChange: 2.5 },
  { id: "2", code: "P002", description: "Wireless Mouse", unit: "pc", currentPrice: 49.99, priceChange: -5.0 },
  { id: "3", code: "P003", description: "4K Monitor", unit: "pc", currentPrice: 399.99, priceChange: 0 },
  { id: "4", code: "P004", description: "SSD Drive 1TB", unit: "pc", currentPrice: 129.99, priceChange: -2.3 },
  { id: "5", code: "P005", description: "USB-C Cable", unit: "pc", currentPrice: 12.99, priceChange: 1.5 },
];

const Dashboard = () => {
  const [loading, setLoading] = React.useState(false);

  // In a real implementation, we would fetch products from Supabase here
  React.useEffect(() => {
    // Simulate loading data
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">248</div>
                  <p className="text-xs text-muted-foreground">
                    +12 this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Price Increases
                  </CardTitle>
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">36</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Price Decreases
                  </CardTitle>
                  <ArrowDown className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">19</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Price Change
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2.4%</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>
                  View and manage your product prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-10 px-4 text-left align-middle font-medium">
                                Product Code
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium">
                                Description
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium">
                                Unit
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium">
                                Current Price
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium">
                                Change
                              </th>
                              <th className="h-10 px-4 text-right align-middle font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockProducts.map((product) => (
                              <tr
                                key={product.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle font-medium">
                                  {product.code}
                                </td>
                                <td className="p-4 align-middle">
                                  {product.description}
                                </td>
                                <td className="p-4 align-middle">
                                  {product.unit}
                                </td>
                                <td className="p-4 align-middle">
                                  ${product.currentPrice.toFixed(2)}
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center">
                                    {product.priceChange > 0 ? (
                                      <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                                    ) : product.priceChange < 0 ? (
                                      <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                                    ) : (
                                      <span className="mr-5"></span>
                                    )}
                                    <span
                                      className={
                                        product.priceChange > 0
                                          ? "text-emerald-500"
                                          : product.priceChange < 0
                                          ? "text-rose-500"
                                          : ""
                                      }
                                    >
                                      {product.priceChange > 0 ? "+" : ""}
                                      {product.priceChange === 0
                                        ? "0.0%"
                                        : product.priceChange.toFixed(1) + "%"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle text-right">
                                  <Button variant="ghost" size="sm">
                                    View History
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="h-[400px] flex items-center justify-center text-muted-foreground">
            Analytics content coming soon
          </TabsContent>
          <TabsContent value="reports" className="h-[400px] flex items-center justify-center text-muted-foreground">
            Reports content coming soon
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
