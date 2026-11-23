
"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc, writeBatch, getDocs, where, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Search, Loader2, MapPin, CheckCircle2, MoreVertical, X, RefreshCw, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import Image from "next/image";
import Link from "next/link";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { mediaFor } from "@/lib/media";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

const CIRCUITS = ["Northern Circuit", "Southern Circuit", "Western Frontiers", "Zanzibar & Islands", "The Peaks"];

export default function DestinationsRegistry() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pulling, setPulling] = useState(false);

  const destinationsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "destinations"), orderBy("createdAt", "desc")) : null, 
    [db, user]
  );
  
  const { data: destinations, loading } = useCollection(destinationsQuery);

  const filteredDestinations = destinations?.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.circuit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const docRef = doc(db, "destinations", id);
    
    updateDoc(docRef, { 
      status: newStatus,
      updatedAt: serverTimestamp() 
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status: newStatus },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    toast({ 
      title: "Visibility Updated", 
      description: `${name} is now ${newStatus === 'active' ? 'PUBLIC (Visible to visitors)' : 'PRIVATE (Hidden from visitors)'}.` 
    });
  };

  const handlePullFromWebsite = async () => {
    setPulling(true);
    const batch = writeBatch(db);
    let imported = 0;
    let updated = 0;
    
    try {
      for (const master of MASTER_DESTINATIONS) {
        const existing = destinations?.find(d => d.name === master.name);
        const imgData = mediaFor(master.imageId);
        
        const mediaQuery = query(collection(db, "media"), where("url", "==", imgData.src));
        const mediaSnap = await getDocs(mediaQuery);
        if (mediaSnap.empty) {
          const mediaRef = doc(collection(db, "media"));
          batch.set(mediaRef, {
            name: master.name,
            url: imgData.src,
            folder: "cms/destinations",
            status: "active",
            createdAt: serverTimestamp(),
            size: 0,
            mimeType: "image/webp"
          });
        }

        if (existing) {
          const docRef = doc(db, "destinations", existing.id);
          batch.update(docRef, {
            ...master,
            featuredImage: imgData.src,
            updatedAt: serverTimestamp()
          });
          updated++;
        } else {
          const docRef = doc(collection(db, "destinations"));
          batch.set(docRef, {
            ...master,
            featuredImage: imgData.src,
            gallery: [],
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          imported++;
        }
      }

      await batch.commit();
      toast({ 
        title: "Synchronization Complete", 
        description: `Imported ${imported}, updated ${updated} destinations.` 
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setPulling(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const destData = {
      name: formData.get("name") as string,
      circuit: formData.get("circuit") as string,
      type: formData.get("type") as string,
      distance: formData.get("distance") as string,
      shortDescription: formData.get("shortDescription") as string,
      description: formData.get("description") as string,
      featuredImage: editingDest?.featuredImage || "",
      gallery: editingDest?.gallery || [],
      status: formData.get("status") as string,
      updatedAt: serverTimestamp(),
    };

    const docRef = editingDest?.id ? doc(db, "destinations", editingDest.id) : doc(collection(db, "destinations"));

    try {
      await setDoc(docRef, { 
        ...destData, 
        createdAt: editingDest?.createdAt || serverTimestamp() 
      }, { merge: true });
      
      toast({ title: "Landmark Saved", description: "Registry has been synchronized." });
      setIsDialogOpen(false);
      setEditingDest(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this destination from the registry?")) return;
    try {
      await deleteDoc(doc(db, "destinations", id));
      toast({ title: "Landmark Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Destinations Hub</h1>
          <p className="text-muted-foreground">Manage Tanzanian landmarks. Items marked PUBLIC are visible without authentication.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search landmarks..." 
              className="pl-10 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handlePullFromWebsite} 
            disabled={pulling}
            className="border-honey-gold text-honey-gold hover:bg-honey-gold hover:text-white rounded-xl font-bold"
          >
            {pulling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Pull from Website
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold">
            <Plus className="w-4 h-4 mr-2" /> New Landmark
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Landmark</TableHead>
              <TableHead>Circuit</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : filteredDestinations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">No destinations found in registry.</TableCell>
              </TableRow>
            ) : (
              filteredDestinations?.map((d: any) => (
                <TableRow key={d.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                        {d.featuredImage && <Image src={d.featuredImage} alt="" fill className="object-cover" />}
                      </div>
                      <span className="font-bold">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] font-bold uppercase">{d.circuit}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none">
                          <Badge className={cn(
                            "font-bold uppercase text-[9px] cursor-pointer hover:opacity-80 transition-opacity",
                            d.status === 'active' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {d.status === 'active' ? 'PUBLIC' : 'PRIVATE'}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-xl">
                        <DropdownMenuItem onSelect={() => handleToggleStatus(d.id, d.status, d.name)}>
                          {d.status === 'active' ? "Move to Private (Hidden)" : "Make Public (Visible to all)"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-full" asChild>
                         <Link href={`/destinations/${d.id}`} target="_blank">
                           <ExternalLink className="w-4 h-4" />
                         </Link>
                       </Button>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-4 h-4" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="rounded-xl">
                           <DropdownMenuItem onSelect={() => { setEditingDest(d); setIsDialogOpen(true); }}>
                             <Edit className="w-4 h-4 mr-2" /> Edit Identity
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(d.id)}>
                             <Trash2 className="w-4 h-4 mr-2" /> Delete Landmark
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingDest(null); }}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 border-none bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-honey-gold shrink-0" />
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-8 border-b shrink-0 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-3xl font-headline font-bold">Destination Identity Editor</DialogTitle>
                  <DialogDescription>Define authoritative attributes and public visibility.</DialogDescription>
                </div>
                {editingDest?.id && (
                  <Button variant="outline" size="sm" asChild className="rounded-xl h-10">
                    <Link href={`/destinations/${editingDest.id}`} target="_blank">
                      <Eye className="w-4 h-4 mr-2" /> Preview Live
                    </Link>
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Name</Label>
                  <Input name="name" defaultValue={editingDest?.name} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Circuit</Label>
                  <Select name="circuit" defaultValue={editingDest?.circuit || CIRCUITS[0]}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CIRCUITS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Category / Type</Label>
                  <Input name="type" defaultValue={editingDest?.type} placeholder="e.g. Wildlife Sanctuary" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Visibility Status</Label>
                  <Select name="status" defaultValue={editingDest?.status || "active"}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active">Public (Visible to all)</SelectItem>
                      <SelectItem value="draft">Private (Hidden from visitors)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Featured Identity Photo</Label>
                <div className="flex gap-4 items-center p-6 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
                  {editingDest?.featuredImage ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-xl group bg-white border">
                      <Image src={editingDest.featuredImage} alt="" fill className="object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setEditingDest({...editingDest, featuredImage: ""})}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border shadow-inner">
                      <MapPin className="w-10 h-10 opacity-10" />
                    </div>
                  )}
                  <MediaLibraryDialog onSelect={(url) => setEditingDest({...editingDest, featuredImage: url})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Logistics / Access</Label>
                <Input name="distance" defaultValue={editingDest?.distance} placeholder="e.g. 180km from Arusha" className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Teaser Narrative</Label>
                <Input name="shortDescription" defaultValue={editingDest?.shortDescription} placeholder="One sentence teaser..." className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Landmark Discovery Full Text</Label>
                <textarea 
                  name="description" 
                  defaultValue={editingDest?.description}
                  className="w-full min-h-[200px] p-4 rounded-2xl border bg-muted/10 focus:ring-2 focus:ring-honey-gold focus:outline-none transition-all text-sm leading-relaxed"
                  placeholder="Detailed history, biodiversity, and frontier highlights..."
                />
              </div>
            </div>

            <DialogFooter className="p-8 border-t bg-muted/30 shrink-0 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl flex-1 h-12">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-honey-gold text-honey-dark font-bold rounded-xl h-12 flex-1 shadow-xl shadow-honey-gold/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Commit Landmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
