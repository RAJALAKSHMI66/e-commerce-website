import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductContext';
import { categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const {
    totalItems
  } = useCart();
  const {
    count: wishlistCount
  } = useWishlist();
  const {
    setCategory,
    setSearch,
    searchQuery
  } = useProducts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchValue);
    navigate('/products');
  };
  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId as any);
    navigate('/products');
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">ShopNow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  Categories
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => handleCategorySelect('all')}>
                  <span className="mr-2">🌟</span>
                  All Products
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map(category => <DropdownMenuItem key={category.id} onClick={() => handleCategorySelect(category.id)}>
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input type="text" placeholder="Search products..." value={searchValue} onChange={e => setSearchValue(e.target.value)} className="w-80 input-search pl-10 pr-4 py-2 text-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'seller') && <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Link to="/login">
                <Button variant="default" size="sm" className="ml-2">
                  Sign In
                </Button>
              </Link>}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input type="text" placeholder="Search products..." value={searchValue} onChange={e => setSearchValue(e.target.value)} className="w-full input-search pl-10 pr-4 py-3" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <button onClick={() => {
            handleCategorySelect('all');
            setMobileMenuOpen(false);
          }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                <span>🌟</span> All Products
              </button>
              {categories.map(category => <button key={category.id} onClick={() => {
            handleCategorySelect(category.id);
            setMobileMenuOpen(false);
          }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                  <span>{category.icon}</span> {category.name}
                </button>)}
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;