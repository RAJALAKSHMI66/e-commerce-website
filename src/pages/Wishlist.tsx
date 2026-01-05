import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Layout from '@/components/Layout';
import WishlistItemComponent from '@/components/WishlistItem';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';

const Wishlist: React.FC = () => {
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-main py-16 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save items you love to your wishlist and access them anytime.
          </p>
          <Link to="/products">
            <Button>Explore Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Button variant="ghost" onClick={clearWishlist} className="text-destructive hover:text-destructive">
            Clear Wishlist
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map(item => (
            <WishlistItemComponent key={item.product.id} item={item} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
