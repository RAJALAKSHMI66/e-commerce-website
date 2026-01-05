import React from 'react';
import { useProducts } from '@/context/ProductContext';
import { categories } from '@/data/products';
import { Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProductFilters: React.FC = () => {
  const { selectedCategory, setCategory, sortBy, setSortBy, filteredProducts } = useProducts();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Results Count */}
      <p className="text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value: Category | 'all') => setCategory(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select
          value={sortBy}
          onValueChange={(value: any) => setSortBy(value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;
