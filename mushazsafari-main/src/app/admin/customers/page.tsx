"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, DollarSign, History, Loader2, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";

export default function CustomerDirectory() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const ordersQuery = useMemoFirebase(() => 
    user ? collection(db, "orders") : null, 
    [db, user]
  );
  const { data: orders, loading } = useCollection(ordersQuery);

  const customersMap = orders?.reduce((acc: any, order) => {
    const email = order.email?.toLowerCase();
    if (!email) return acc;
    if (!acc[email]) {
      acc[email] = {
        email,
        name: order.customerName,
        phone: order.phone,
        address: order.address,
        totalSpent: 0,
        orderCount: 0,
        lastOrder: order.createdAt,
        orders: [],
      };
    }
    acc[email].totalSpent += order.totalPrice || 0;
    acc[email].orderCount += 1;
    acc[email].orders.push(order);
    return acc;
  }, {}) || {};

  const customers: any[] = Object.values(customersMap).sort((a: any, b: any) => b.totalSpent - a.totalSpent);

  const filteredCustomers = customers.filter((c: any) => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSegment = (totalSpent: number, orderCount: number) => {
    if (totalSpent > 1000000) return { label: "VIP", color: "bg-purple-500" };
    if (orderCount > 5) return { label: "Loyal", color: "bg-blue-500" };
    if (orderCount === 1) return { label: "New", color: "bg-green-500" };
    return { label: "Regular", color: "bg-slate-500" };
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
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Customer Database</h1>
          <p className="text-muted-foreground">Deep analysis of customer behavior and lifetime value.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers..." 
            className="pl-10 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Customers", val: customers.length, icon: User },
          { title: "Avg. Customer LTV", val: `${Math.round(customers.reduce((acc: number, c: any) => acc + (c.totalSpent || 0), 0) / (customers.length || 1)).toLocaleString()} TZS`, icon: DollarSign },
          { title: "Repeat Rate", val: `${Math.round((customers.filter((c: any) => c.orderCount > 1).length / (customers.length || 1)) * 100)}%`, icon: History },
          { title: "VIP Customers", val: customers.filter((c: any) => c.totalSpent > 1000000).length, icon: Badge },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total LTV</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">No customers found.</TableCell></TableRow>
            ) : (
              filteredCustomers.map((c: any) => {
                const segment = getSegment(c.totalSpent, c.orderCount);
                return (
                  <TableRow key={c.email} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={segment.color}>{segment.label}</Badge>
                    </TableCell>
                    <TableCell>{c.orderCount}</TableCell>
                    <TableCell className="font-bold text-honey-gold">{c.totalSpent.toLocaleString()} TZS</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.lastOrder?.toDate ? format(c.lastOrder.toDate(), 'MMM d, yyyy') : 'Recent'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(c)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline">Customer Insight</DialogTitle>
            <DialogDescription>Viewing detailed history for {selectedCustomer?.name}</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-2xl border">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Contact Details</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {selectedCustomer.phone}</p>
                    <p className="text-sm"><strong>Address:</strong> {selectedCustomer.address}</p>
                  </div>
                  <div className="p-4 bg-honey-gold/5 rounded-2xl border border-honey-gold/10">
                    <p className="text-[10px] font-bold uppercase text-honey-gold mb-2">Internal Notes</p>
                    <textarea 
                      className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[100px]" 
                      placeholder="Add private notes about this customer..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Purchase History</p>
                   <div className="space-y-2 max-h-[300px] overflow-auto no-scrollbar">
                     {selectedCustomer.orders.map((o: any) => (
                       <div key={o.id} className="p-3 bg-white rounded-xl border flex justify-between items-center text-xs">
                         <div>
                            <p className="font-bold">Order #{o.id.substring(0, 6)}</p>
                            <p className="text-muted-foreground">{o.items.length} items</p>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-honey-gold">{o.totalPrice.toLocaleString()} TZS</p>
                            <p className="text-muted-foreground">{o.status}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button className="bg-honey-gold text-honey-dark font-bold rounded-xl">
                  <FileText className="w-4 h-4 mr-2" /> Export Customer Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}