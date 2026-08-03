
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Ticket, Zap, Calendar, Loader2, Mail, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function MarketingPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("coupons");
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);

  const couponsQuery = useMemoFirebase(() => query(collection(db, "coupons"), orderBy("expiryDate", "desc")), [db]);
  const { data: coupons, loading: couponsLoading } = useCollection(couponsQuery);

  const salesQuery = useMemoFirebase(() => query(collection(db, "flash_sales"), orderBy("endDate", "desc")), [db]);
  const { data: sales, loading: salesLoading } = useCollection(salesQuery);

  const newsletterQuery = useMemoFirebase(() => query(collection(db, "newsletter"), orderBy("createdAt", "desc")), [db]);
  const { data: subscribers, loading: newsletterLoading } = useCollection(newsletterQuery);

  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string),
      usageLimit: parseInt(formData.get("limit") as string) || null,
      expiryDate: formData.get("expiry") as string,
      active: true,
      usageCount: 0,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "coupons"), data);
      setIsCouponDialogOpen(false);
      toast({ title: "Coupon Created", description: `Code ${data.code} is now active.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not create coupon." });
    }
  };

  const handleAddSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      startDate: formData.get("start") as string,
      endDate: formData.get("end") as string,
      discountPercentage: parseFloat(formData.get("discount") as string),
      active: true,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "flash_sales"), data);
      setIsSaleDialogOpen(false);
      toast({ title: "Flash Sale Created", description: `${data.name} scheduled.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not schedule sale." });
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, coll, id));
      toast({ title: "Deleted", description: "Item removed successfully." });
    }
  };

  const exportNewsletter = () => {
    if (!subscribers || subscribers.length === 0) return;
    
    const csvContent = "Email,Date Subscribed\n" + 
      subscribers.map(s => `"${s.email}","${s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : 'N/A'}"`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Alvena_Newsletter_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Subscribers Exported", description: "CSV file generated successfully." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Marketing Center</h1>
        <p className="text-muted-foreground">Manage discounts, promotions, and flash sales.</p>
      </div>

      <Tabs defaultValue="coupons" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="coupons" className="flex gap-2">
            <Ticket className="w-4 h-4" /> Coupons
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex gap-2">
            <Zap className="w-4 h-4" /> Flash Sales
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="flex gap-2">
            <Mail className="w-4 h-4" /> Newsletter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Discount Coupons</h3>
            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> New Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddCoupon}>
                  <DialogHeader>
                    <DialogTitle>Create Coupon</DialogTitle>
                    <DialogDescription>Set up a new discount code for your customers.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Coupon Code</Label>
                      <Input name="code" placeholder="SUMMER25" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select name="type" defaultValue="percentage">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (TZS)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input name="value" type="number" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Usage Limit</Label>
                        <Input name="limit" type="number" placeholder="Optional" />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input name="expiry" type="date" required />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-honey-gold text-honey-dark">Create Coupon</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : coupons?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10">No coupons active.</TableCell></TableRow>
                ) : (
                  coupons?.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold">{c.code}</TableCell>
                      <TableCell>
                        {c.type === "percentage" ? `${c.value}%` : `${c.value.toLocaleString()} TZS`}
                      </TableCell>
                      <TableCell>{c.usageCount} / {c.usageLimit || '∞'}</TableCell>
                      <TableCell className="text-xs">
                        {c.expiryDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.active ? "default" : "outline"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("coupons", c.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Flash Sales</h3>
            <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> New Flash Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddSale}>
                  <DialogHeader>
                    <DialogTitle>Schedule Flash Sale</DialogTitle>
                    <DialogDescription>Apply a global discount for a specific time period.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Sale Name</Label>
                      <Input name="name" placeholder="Black Friday Flash" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Percentage (%)</Label>
                      <Input name="discount" type="number" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input name="start" type="datetime-local" required />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input name="end" type="datetime-local" required />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-honey-gold text-honey-dark">Schedule Sale</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : sales?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10">No sales scheduled.</TableCell></TableRow>
                ) : (
                  sales?.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell>{s.discountPercentage}%</TableCell>
                      <TableCell className="text-[10px] leading-tight">
                        From: {s.startDate.replace('T', ' ')}<br />
                        To: {s.endDate.replace('T', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500">Scheduled</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("flash_sales", s.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Newsletter Subscribers</h3>
              <p className="text-xs text-muted-foreground">View and export emails for marketing campaigns.</p>
            </div>
            <Button 
              onClick={exportNewsletter}
              disabled={!subscribers || subscribers.length === 0}
              className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold"
            >
              <Download className="w-4 h-4 mr-2" /> Export Subscribers (CSV)
            </Button>
          </div>

          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletterLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
                ) : subscribers?.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10">No subscribers yet.</TableCell></TableRow>
                ) : (
                  subscribers?.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold">{s.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.createdAt?.toDate ? format(s.createdAt.toDate(), 'PPP p') : 'Recent'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("newsletter", s.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
