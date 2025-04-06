
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  className?: string;
}

const ProductSearch = ({ searchTerm, setSearchTerm, className = "" }: ProductSearchProps) => {
  return (
    <div className={`relative w-full md:w-96 ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4"
      />
    </div>
  );
};

export default ProductSearch;
