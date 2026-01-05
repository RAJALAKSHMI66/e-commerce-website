import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { WishlistItem as WishlistItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';

interface WishlistItemProps {
  item: WishlistItemType;
}

const WishlistItemComponent: React.FC<WishlistItemProps> = ({ item }) => {
  const { addItem, isInCart } = useCart();
  const { removeItem } = useWishlist();
  const { product } = item;

  const discountedPrice = product.price * (1 - product.discount / 100);
  const inCart = isInCart(product.id);

  const handleMoveToCart = () => {
    addItem(product);
    removeItem(product.id);
  };

  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl border border-border">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-4 h-4 rating-star fill-current" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-foreground">
            ${discountedPrice.toFixed(2)}
          </span>
          {product.discount > 0 && (
            <>
              <span className="price-original text-xs">
                ${product.price.toFixed(2)}
              </span>
              <span className="badge-sale text-xs">-{product.discount}%</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={handleMoveToCart}
            disabled={product.stock === 0 || inCart}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {inCart ? 'In Cart' : 'Move to Cart'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeItem(product.id)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItemComponent;
