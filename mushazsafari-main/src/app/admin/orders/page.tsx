"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Calendar, User, Phone, MapPin, Loader2, Eye, ShoppingBag, Mail, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminOrders() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const ordersQuery = useMemoFirebase(() => 
    user ? query(collection(db, "orders"), orderBy("createdAt", "desc")) : null,
    [db, user]
  );
  
  const { data: orders, loading } = useCollection(ordersQuery);
  const { toast } = useToast();

  const filteredOrders = orders?.filter(order => 
    order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", id));
        toast({
          title: "Order Deleted",
          description: "The order has been removed.",
        });
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete order.",
        });
      }
    }
  };

  const handleSendEmail = async () => {
    if (!selectedOrder) return;
    
    setEmailLoading(true);
    setEmailError(null);
    try {
      const response = await fetch("/api/admin/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: selectedOrder }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email Sent!",
          description: "The order ticket has been sent to the admin email for testing.",
        });
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error: any) {
      setEmailError(error.message);
      toast({
        variant: "destructive",
        title: "Email Error",
        description: error.message,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  if (userLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-honey-gold" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Customer Orders</h1>
          <p className="text-muted-foreground">Manage and track product orders from your shop.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders?.map((order: any) => (
                  <TableRow 
                    key={order.id} 
                    className="group hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setEmailError(null);
                    }}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-2">
                          <User className="w-3 h-3 text-honey-gold" />
                          {order.customerName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.items?.slice(0, 2).map((item: any, i: number) => (
                          <span key={i} className="text-xs">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {order.items?.length > 2 && (
                          <span className="text-[10px] text-muted-foreground font-medium italic">
                            + {order.items.length - 2} more items
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-honey-gold">
                      {order.totalPrice?.toLocaleString()} TZS
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-honey-gold/5 text-honey-gold border-honey-gold/20">
                        {order.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-honey-gold"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-destructive"
                          onClick={(e) => handleDelete(e, order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl rounded-2xl bg-white/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
              <ShoppingBag className="text-honey-gold w-6 h-6" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id} • Placed on {selectedOrder?.createdAt?.toDate ? format(selectedOrder.createdAt.toDate(), 'PPP p') : 'N/A'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4">
              {emailError && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Failed</AlertTitle>
                  <AlertDescription className="text-xs">
                    {emailError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Customer Information</p>
                    <p className="font-bold text-lg">{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                    <p className="text-sm font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Shipping Address</p>
                    <p className="text-sm bg-muted/30 p-4 rounded-xl border border-border/50">
                      <MapPin className="w-3 h-3 inline mr-2 text-honey-gold" />
                      {selectedOrder.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Order Items</p>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-border/50">
                        <div className="flex flex-col">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-bold text-honey-gold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-honey-gold/10 flex justify-between items-center">
                    <span className="text-sm font-bold">Estimated Total</span>
                    <span className="text-xl font-bold text-honey-gold">{selectedOrder.totalPrice?.toLocaleString()} TZS</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/50">
                 <Badge className="bg-honey-gold/10 text-honey-gold hover:bg-honey-gold/20 border-none px-4 py-1">
                    Status: {selectedOrder.status || 'Pending'}
                 </Badge>
                 <div className="flex gap-3">
                    <Button 
                      onClick={handleSendEmail}
                      disabled={emailLoading}
                      variant="outline"
                      className="border-honey-gold text-honey-gold hover:bg-honey-gold hover:text-honey-dark rounded-xl font-bold"
                    >
                      {emailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                      Send Ticket to Admin
                    </Button>
                    <Button 
                      onClick={() => setSelectedOrder(null)}
                      className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold"
                    >
                      Close
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}