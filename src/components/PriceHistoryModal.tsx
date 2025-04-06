
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number;
}

interface PriceHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  productName: string;
  priceHistory: PriceHistory[];
  loading: boolean;
}

const PriceHistoryModal = ({ 
  open, 
  onOpenChange, 
  productCode, 
  productName, 
  priceHistory,
  loading
}: PriceHistoryModalProps) => {
  const sortedHistory = [...priceHistory].sort((a, b) => 
    new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Price History for {productName} ({productCode})</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="w-full py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">Loading price history...</p>
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="w-full py-8 text-center">
            <p className="text-sm text-gray-500">No price history found</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((item, index) => {
                  // Calculate price change from previous
                  const prevPrice = index < sortedHistory.length - 1 ? sortedHistory[index + 1].unitprice : null;
                  const priceChange = prevPrice ? ((item.unitprice - prevPrice) / prevPrice) * 100 : null;
                  
                  return (
                    <TableRow key={item.effdate}>
                      <TableCell>{format(new Date(item.effdate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>${item.unitprice.toFixed(2)}</TableCell>
                      <TableCell>
                        {priceChange !== null ? (
                          <span className={
                            priceChange > 0 
                              ? "text-emerald-500" 
                              : priceChange < 0 
                              ? "text-rose-500" 
                              : ""
                          }>
                            {priceChange > 0 ? "+" : ""}
                            {priceChange.toFixed(2)}%
                          </span>
                        ) : (
                          "Initial Price"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PriceHistoryModal;
