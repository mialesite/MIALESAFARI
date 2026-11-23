"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc, writeBatch, getDocs, where, updateDoc, deleteField } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Search, Loader2, Compass, CheckCircle2, MoreVertical, X, Eye, ExternalLink, RefreshCw, Globe } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TOURS } from "@/lib/tours";

// The figures the old static list invented for these slugs. A row is only
// touched when its priceFrom still equals the placeholder for its own slug,
// so any real figure the desk enters later is never cleared.
const INVENTED_PRICE_BY_SLUG: Record<string, number> = {
  "serengeti-migration-journey": 6500,
  "central-serengeti-deep-dive": 4200,
  "ndutu-calving-season": 3200,
  "kilimanjaro-lemosho-route": 2300,
  "tarangire-elephant-heritage": 850,
  "zanzibar-stone-town-beach": 1400,
  "nyerere-river-boat-safari": 1500,
  "ruaha-wilderness-expedition": 1680,
  "mikumi-savanna-escape": 480,
  "gombe-chimpanzee-trek": 2100,
  "mahale-mountains-luxury": 3000,
};

export default function ItineraryManager() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [step, setStep] = useState(1);

  const itinerariesQuery = useMemoFirebase(() => 
    user ? query(collection(db, "itineraries"), orderBy("createdAt", "desc")) : null, 
    [db, user]
  );
  const { data: itineraries, loading } = useCollection(itinerariesQuery);

  const filtered = itineraries?.filter(i => 
    i.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSync = async () => {
    if (!window.confirm("Restore the complete Miale signature collection? This will not duplicate existing slugs.")) return;
    
    setSeeding(true);
    const batch = writeBatch(db);
    let count = 0;

    try {
      for (const master of TOURS) {
        const existingQuery = query(collection(db, "itineraries"), where("slug", "==", master.slug));
        const existingSnap = await getDocs(existingQuery);
        
        if (existingSnap.empty) {
          const docRef = doc(collection(db, "itineraries"));
          batch.set(docRef, {
            ...master,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast({ title: "Collection Synchronized", description: `Imported ${count} signature expeditions.` });
      } else {
        toast({ title: "Registry Up to Date", description: "All signature experiences are already in the registry." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Authorization required for master updates." });
    } finally {
      setSeeding(false);
    }
  };

  const handleClearPlaceholderPrices = async () => {
    if (!itineraries?.length) return;

    const rows = itineraries.filter((i: any) => {
      const invented = i.slug ? INVENTED_PRICE_BY_SLUG[i.slug] : undefined;
      return invented !== undefined && Number(i.priceFrom) === invented;
    });

    if (!rows.length) {
      toast({ title: "Nothing to Clear", description: "No row still carries the old placeholder figure for its slug." });
      return;
    }

    const summary = rows.map((r: any) => `${r.title} ($${Number(r.priceFrom).toLocaleString()})`).join("\n");
    if (!confirm(`Remove the placeholder price from ${rows.length} rows?\n\n${summary}\n\nRows carrying a different figure are left untouched.`)) return;

    setClearing(true);
    try {
      for (const r of rows) {
        await updateDoc(doc(db, "itineraries", r.id), { priceFrom: deleteField() });
      }
      toast({ title: "Placeholder Prices Cleared", description: `${rows.length} rows now read "Priced to order" until the desk enters a real figure.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Some rows could not be updated." });
    } finally {
      setClearing(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    if (!title) {
      toast({ variant: "destructive", title: "Error", description: "Expedition Title is required." });
      setSaving(false);
      return;
    }

    const data = {
      title: title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      duration: formData.get("duration") as string,
      priceFrom: parseFloat(formData.get("priceFrom") as string) || 0,
      category: formData.get("category") as string,
      tourType: formData.get("tourType") as string,
      status: formData.get("status") as string,
      featuredImage: editingItem?.featuredImage || "",
      updatedAt: serverTimestamp(),
    };

    const docRef = editingItem?.id ? doc(db, "itineraries", editingItem.id) : doc(collection(db, "itineraries"));

    try {
      await setDoc(docRef, { 
        ...data, 
        createdAt: editingItem?.createdAt || serverTimestamp(),
      }, { merge: true });
      
      toast({ title: "Itinerary Synchronized", description: "Package details are now live in the collection." });
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently remove this expedition?")) return;
    try {
      await deleteDoc(doc(db, "itineraries", id));
      toast({ title: "Itinerary Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-gradient">Expeditions Hub</h1>
          <p className="text-muted-foreground">Master catalog of signature safari packages. Managed in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search catalog..." 
              className="pl-10 h-12 w-64 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleSync} 
            disabled={seeding}
            className="border-honey-gold text-honey-gold rounded-xl h-12 px-6 font-bold"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            Restore Signatures
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearPlaceholderPrices} 
            disabled={clearing}
            className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white rounded-xl h-12 px-6 font-bold"
          >
            {clearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Clear Placeholder Prices
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Package
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Expedition Selection</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Starts From</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-60 text-center text-muted-foreground italic">No expeditions registered.</TableCell></TableRow>
            ) : (
              filtered?.map((item: any) => (
                <TableRow key={item.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border border-muted/50">
                        {item.featuredImage && <Image src={item.featuredImage} alt="" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none mb-2">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-space tracking-widest">{item.duration}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] uppercase font-bold text-secondary">{item.category}</Badge></TableCell>
                  <TableCell className="font-bold text-primary">
                    {item.priceFrom ? `$${Number(item.priceFrom).toLocaleString()}` : item.priceString || "Priced to order"}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold uppercase text-[9px] px-3 py-1",
                      item.status === 'active' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {item.status || 'DRAFT'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                         <Link href={`/tours/${item.slug || item.id}`} target="_blank">
                           <Eye className="w-4 h-4" />
                         </Link>
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                         <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive rounded-full h-9 w-9" onClick={() => handleDelete(item.id)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); setStep(1); }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 border-none bg-safari-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-secondary shrink-0" />
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 border-b shrink-0 bg-white">
              <div className="flex items-center gap-3 text-secondary mb-1">
                <Compass className="w-4 h-4" />
                <span className="text-[10px] font-space font-bold uppercase tracking-[0.3em]">Editor Mode · Step {step} of 2</span>
              </div>
              <DialogTitle className="text-xl font-headline font-bold">Package Detail Architect</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 no-scrollbar">
              <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", step !== 1 && "hidden")}>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Expedition Title</Label>
                  <Input name="title" defaultValue={editingItem?.title} required className="h-12 rounded-xl focus:ring-secondary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Duration Profile</Label>
                  <Input name="duration" defaultValue={editingItem?.duration} placeholder="e.g. 12 Days" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rate (USD From)</Label>
                  <Input type="number" name="priceFrom" defaultValue={editingItem?.priceFrom} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Tour Category</Label>
                  <Select name="category" defaultValue={editingItem?.category || "Migration"}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {["Migration", "Luxury", "Bespoke", "Family", "Mountain", "Zanzibar"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Initial Status</Label>
                  <Select name="status" defaultValue={editingItem?.status || "active"}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active">Active (Visible in Collection)</SelectItem>
                      <SelectItem value="draft">Internal Draft (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={cn("space-y-8", step !== 2 && "hidden")}>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Signature Portfolio Photography</Label>
                  <div className="flex gap-6 items-center p-8 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50 transition-colors hover:bg-muted/30">
                    {editingItem?.featuredImage ? (
                      <div className="relative w-48 h-32 rounded-2xl overflow-hidden shadow-2xl border bg-white group">
                        <Image src={editingItem.featuredImage} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => setEditingItem({...editingItem, featuredImage: ""})} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X className="w-6 h-6" /></button>
                      </div>
                    ) : (
                      <div className="w-48 h-32 bg-white rounded-2xl flex items-center justify-center border shadow-inner"><Globe className="w-10 h-10 opacity-10" /></div>
                    )}
                    <MediaLibraryDialog onSelect={(url) => setEditingItem({...editingItem, featuredImage: url})} trigger={<Button variant="outline" className="h-12 rounded-xl px-8 font-bold border-secondary text-secondary hover:bg-secondary hover:text-white">Choose from Library</Button>} />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/20 shrink-0 gap-4">
              {step === 2 && <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-xl h-14 flex-1 font-bold">Previous Step</Button>}
              {step === 1 ? (
                <Button type="button" onClick={() => setStep(2)} className="bg-primary text-white rounded-xl h-14 flex-1 font-bold shadow-xl shadow-primary/10">Next: Assets & Details</Button>
              ) : (
                <Button type="submit" disabled={saving} className="bg-secondary text-white font-bold rounded-xl h-14 flex-1 shadow-2xl shadow-secondary/30">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Commit Package to Collection
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
