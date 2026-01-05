import React, { useState } from 'react';
import { Package, Users, ShoppingBag, Plus, Trash2, Edit } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProducts } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';
import { categories } from '@/data/products';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { products, addProduct, deleteProduct } = useProducts();
  const { getAllOrders } = useOrders();
  const { toast } = useToast();
  const orders = getAllOrders();

  const [newProduct, setNewProduct] = useState({ name: '', category: 'electronics' as Category, price: '', discount: '0', stock: '', description: '', brand: '', image: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) { toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' }); return; }
    addProduct({
      name: newProduct.name, category: newProduct.category, price: parseFloat(newProduct.price), discount: parseFloat(newProduct.discount) || 0,
      stock: parseInt(newProduct.stock) || 10, description: newProduct.description || 'No description', rating: 4.5, reviewCount: 0,
      images: [newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], features: ['New Product'], brand: newProduct.brand || 'Generic'
    });
    toast({ title: 'Product added!' });
    setNewProduct({ name: '', category: 'electronics', price: '', discount: '0', stock: '', description: '', brand: '', image: '' });
    setDialogOpen(false);
  };

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container-main py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>Name *</Label><Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                  <div><Label>Category</Label>
                    <Select value={newProduct.category} onValueChange={(v: Category) => setNewProduct({...newProduct, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Price *</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                    <div><Label>Discount %</Label><Input type="number" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Stock</Label><Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /></div>
                    <div><Label>Brand</Label><Input value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
                  </div>
                  <div><Label>Image URL</Label><Input value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} /></div>
                  <Button onClick={handleAddProduct}>Add Product</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4"><Package className="w-8 h-8 text-primary mb-2" /><p className="text-2xl font-bold">{products.length}</p><p className="text-muted-foreground text-sm">Products</p></div>
            <div className="bg-card rounded-xl border p-4"><ShoppingBag className="w-8 h-8 text-accent mb-2" /><p className="text-2xl font-bold">{orders.length}</p><p className="text-muted-foreground text-sm">Orders</p></div>
            <div className="bg-card rounded-xl border p-4"><Users className="w-8 h-8 text-success mb-2" /><p className="text-2xl font-bold">${orders.reduce((sum, o) => sum + o.finalAmount, 0).toFixed(0)}</p><p className="text-muted-foreground text-sm">Revenue</p></div>
          </div>

          <Tabs defaultValue="products">
            <TabsList><TabsTrigger value="products">Products</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger></TabsList>
            <TabsContent value="products" className="space-y-2 mt-4">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 bg-card rounded-lg border p-3">
                  <img src={p.images[0]} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-muted-foreground">${p.price} • {p.stock} in stock</p></div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { deleteProduct(p.id); toast({ title: 'Product deleted' }); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="orders" className="space-y-2 mt-4">
              {orders.length === 0 ? <p className="text-muted-foreground py-8 text-center">No orders yet.</p> : orders.map(o => (
                <div key={o.id} className="bg-card rounded-lg border p-3">
                  <div className="flex justify-between"><p className="font-mono text-sm">{o.id}</p><span className="text-success capitalize">{o.status}</span></div>
                  <p className="text-sm text-muted-foreground">{o.items.length} items • ${o.finalAmount.toFixed(2)}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Admin;
