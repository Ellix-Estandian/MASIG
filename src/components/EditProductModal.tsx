
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/ProductTable";
import { useActivityLog } from "@/hooks/useActivityLog";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onProductUpdated: () => void;
}

const EditProductModal = ({ 
  open, 
  onOpenChange, 
  product,
  onProductUpdated 
}: EditProductModalProps) => {
  const [description, setDescription] = useState(product.description || "");
  const [unit, setUnit] = useState(product.unit || "");
  const [price, setPrice] = useState<string>(
    product.current_price !== null 
      ? product.current_price.toString() 
      : ""
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // First update the product details
      const { error: productError } = await supabase
        .from('product')
        .update({
          description,
          unit
        })
        .eq('prodcode', product.prodcode);
      
      if (productError) throw productError;
      
      // Then, if price has changed, add a new price history record
      const priceChanged = price && (product.current_price === null || parseFloat(price) !== product.current_price);
      
      if (priceChanged) {
        const newPrice = parseFloat(price);
        
        const { error: priceError } = await supabase
          .from('pricehist')
          .insert({
            prodcode: product.prodcode,
            effdate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            unitprice: newPrice
          });
          
        if (priceError) throw priceError;
      }
      
      // Log the activity
      await logActivity({
        action: "edited",
        productCode: product.prodcode,
        productName: description,
        details: {
          previousDescription: product.description,
          newDescription: description,
          previousUnit: product.unit,
          newUnit: unit,
          previousPrice: product.current_price,
          newPrice: price ? parseFloat(price) : null,
          priceChanged: priceChanged
        }
      });
      
      toast({
        title: "Product updated",
        description: "The product has been successfully updated."
      });
      
      onProductUpdated();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Error updating product",
        description: error.message || "An error occurred while updating the product."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.prodcode}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit (e.g., pcs, kg, box)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Current Price</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => {
                  // Allow only numbers and a single decimal point
                  const val = e.target.value;
                  if (val === "" || /^(\d+\.?\d*|\.\d+)$/.test(val)) {
                    setPrice(val);
                  }
                }}
                placeholder="0.00"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Setting a new price will create a new price history record
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
