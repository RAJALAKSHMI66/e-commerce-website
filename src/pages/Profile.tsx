import React, { useState } from 'react';
import { User, Package, MapPin, Settings } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { getOrdersByUserId } = useOrders();
  const { toast } = useToast();

  const orders = user ? getOrdersByUserId(user.id) : [];

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', zipCode: '', country: 'USA' });

  const handleSaveProfile = () => {
    updateProfile({ name, phone, address });
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container-main py-8">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
              <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" />Orders</TabsTrigger>
              <TabsTrigger value="address"><MapPin className="w-4 h-4 mr-2" />Address</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <div className="grid gap-4 max-w-md">
                <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div><Label>Email</Label><Input value={user?.email} disabled /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div><Label>Role</Label><Input value={user?.role} disabled className="capitalize" /></div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-bold">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No orders yet.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-card rounded-xl border p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-sm">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm capitalize">{order.status}</span>
                    </div>
                    <p className="font-bold">${order.finalAmount.toFixed(2)} • {order.items.length} items</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="address" className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Saved Address</h2>
              <div className="grid gap-4 max-w-md">
                <div><Label>Street</Label><Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} /></div>
                  <div><Label>State</Label><Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>ZIP</Label><Input value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} /></div>
                  <div><Label>Country</Label><Input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} /></div>
                </div>
                <Button onClick={handleSaveProfile}>Save Address</Button>
              </div>
            </TabsContent>
          </Tabs>

          <Button variant="destructive" className="mt-8" onClick={logout}>Logout</Button>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Profile;
