
"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Map, AlertTriangle, ArrowRightLeft, TrendingDown, Loader2, Save, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ExpeditionAvailability() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState("");

  const productsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "products"), orderBy("stock", "asc")) : null, 
    [db, user]
  );
  const { data: products, loading } = useCollection(productsQuery);

  const logsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "inventory_logs"), orderBy("timestamp", "desc")) : null, 
    [db, user]
  );
  const { data: logs } = useCollection(logsQuery);

  const handleAdjustStock = async () => {
    if (!selectedProduct) return;

    const newStock = (selectedProduct.stock || 0) + adjustment;
    
    try {
      await updateDoc(doc(db, "products", selectedProduct.id), { stock: newStock });

      await addDoc(collection(db, "inventory_logs"), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        change: adjustment,
        reason: reason || "Manual adjustment",
        timestamp: serverTimestamp(),
      });

      toast({ title: "Availability Updated", description: `${selectedProduct.name} capacity is now ${newStock} slots.` });
      setSelectedProduct(null);
      setAdjustment(0);
      setReason("");
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Check Super Admin permissions." });
    }
  };

  const lowStockProducts = products?.filter(p => p.stock < 5) || [];
  const totalSlots = products?.reduce((acc, p) => acc + (p.stock || 0), 0) || 0;

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
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Expedition Availability</h1>
        <p className="text-muted-foreground">Monitor trip capacity, booking slots, and logistics history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-destructive/5 border-destructive/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Limited Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockProducts.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Expeditions with less than 5 slots</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-honey-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-honey-gold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSlots} Slots</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total combined bookable capacity</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" /> Logistics Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Updates recorded this cycle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Current Trip Slots</CardTitle>
            <CardDescription>Select an expedition to adjust booking capacity.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expedition</TableHead>
                  <TableHead>Available Slots</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : products?.map((p: any) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedProduct(p)}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-bold">{p.stock}</TableCell>
                    <TableCell>
                      {p.stock < 5 ? (
                        <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
                      ) : p.stock < 10 ? (
                        <Badge className="bg-amber-500">LIMITED</Badge>
                      ) : (
                        <Badge className="bg-green-500">OPEN</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Capacity History</CardTitle>
            <CardDescription>Audit trail of trip capacity adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px] overflow-auto no-scrollbar">
            <div className="space-y-4">
              {logs?.map((log: any) => (
                <div key={log.id} className="p-3 bg-muted/20 rounded-xl border border-border/50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{log.productName}</p>
                    <p className="text-[10px] text-muted-foreground italic">"{log.reason}"</p>
                  </div>
                  <div className="text-right">
                    <span className={log.change > 0 ? "text-green-500 font-bold" : "text-destructive font-bold"}>
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Recent'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Slots: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Increase or decrease bookable capacity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slot Adjustment (+/-)</Label>
                <Input 
                  type="number" 
                  value={adjustment} 
                  onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5 or -2"
                />
              </div>
              <div className="space-y-2">
                <Label>Updated Capacity</Label>
                <div className="h-10 flex items-center font-bold text-honey-gold bg-muted px-4 rounded-md">
                  {(selectedProduct?.stock || 0) + adjustment}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for adjustment</Label>
              <Input 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="e.g. Cancelled Group, New Vehicle Added"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdjustStock} className="w-full bg-honey-gold text-honey-dark">
              <Save className="w-4 h-4 mr-2" /> Save Capacity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
