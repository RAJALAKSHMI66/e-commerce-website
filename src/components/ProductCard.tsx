import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const discountedPrice = product.price * (1 - product.discount / 100);
  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="block group">
      <div className="card-product relative">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 badge-sale z-10">
            -{product.discount}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all ${
            inWishlist
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-card/80 backdrop-blur-sm text-foreground hover:bg-card'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-secondary/50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.brand}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 rating-star fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="price-original">${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between mb-3">
            {product.stock > 10 ? (
              <span className="text-xs stock-in">In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-xs stock-low">Only {product.stock} left</span>
            ) : (
              <span className="text-xs stock-out">Out of Stock</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full ${inCart ? 'bg-success hover:bg-success/90' : ''}`}
            variant={inCart ? 'default' : 'default'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {inCart ? 'Added to Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
