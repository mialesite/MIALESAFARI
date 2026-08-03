"use client";

import React, { useState } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp, getDocs, where, updateDoc, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, FileStack, Trash2, Calendar, Plus, 
  RefreshCw, CheckCircle2, Eye, MapPin, Compass, 
  Sparkles, Save, ExternalLink, Settings2, ShieldCheck, ShieldAlert,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GalleryManagement() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [placementLoading, setPlacementLoading] = useState(false);

  const mediaQuery = useMemoFirebase(() => 
    user ? query(collection(db, "media"), orderBy("createdAt", "desc")) : null,
    [db, user]
  );
  const { data: assets, loading } = useCollection(mediaQuery);

  const destQuery = useMemoFirebase(() => user ? collection(db, "destinations") : null, [db, user]);
  const { data: destinations } = useCollection(destQuery);

  const itinQuery = useMemoFirebase(() => user ? collection(db, "itineraries") : null, [db, user]);
  const { data: itineraries } = useCollection(itinQuery);

  const handlePullMasterAssets = async () => {
    setSyncing(true);
    const batch = writeBatch(db);
    let imported = 0;
    
    try {
      for (const img of PlaceHolderImages) {
        const existingQuery = query(collection(db, "media"), where("url", "==", img.imageUrl));
        const existingSnap = await getDocs(existingQuery);
        
        if (existingSnap.empty) {
          const mediaRef = doc(collection(db, "media"));
          batch.set(mediaRef, {
            name: img.description,
            url: img.imageUrl,
            folder: "cms/master",
            status: "public",
            createdAt: serverTimestamp(),
            size: 0,
            mimeType: "image/jpeg",
            featured: false
          });
          imported++;
        }
      }

      if (imported > 0) {
        await batch.commit();
        toast({ title: "Gallery Synchronized", description: `Imported ${imported} master assets.` });
      } else {
        toast({ title: "Gallery Up to Date" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this asset?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
      toast({ title: "Asset Deleted" });
      setSelectedAsset(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handlePromoteToHero = async (asset: any) => {
    setPlacementLoading(true);
    try {
      await addDoc(collection(db, "hero_slides"), {
        title: asset.name || "Signature Wilderness",
        subtitle: "Experience the benchmark of luxury safari travel.",
        imageUrl: asset.url,
        buttonText: "Plan My Safari",
        buttonLink: "/contact",
        opacity: 0.6,
        priority: 10,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Hero Created", description: "Asset added to homepage rotation." });
    } catch (e) {
      toast({ variant: "destructive", title: "Placement Error" });
    } finally {
      setPlacementLoading(false);
    }
  };

  const handlePromoteToGallery = async (asset: any) => {
    setPlacementLoading(true);
    try {
      await updateDoc(doc(db, "media", asset.id), {
        featured: true,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Gallery Promotion", description: "Asset marked as Featured for public highlights." });
      setSelectedAsset({ ...selectedAsset, featured: true });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setPlacementLoading(false);
    }
  };

  const handleUpdateAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      status: formData.get("status") as string,
    };
    try {
      await updateDoc(doc(db, "media", selectedAsset.id), updates);
      toast({ title: "Metadata Updated" });
      setSelectedAsset({...selectedAsset, ...updates});
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Master Gallery</h1>
          <p className="text-muted-foreground">Central asset repository. Control public visibility for all photography.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handlePullMasterAssets} 
            disabled={syncing}
            className="border-honey-gold text-honey-gold hover:bg-honey-gold hover:text-white rounded-xl font-bold h-11"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Pull Master Assets
          </Button>
          <MediaLibraryDialog 
            onSelect={() => {}} 
            trigger={
              <Button className="bg-honey-gold text-honey-dark hover:bg-honey-amber px-6 h-11 rounded-xl font-bold shadow-lg shadow-honey-gold/20">
                <Plus className="w-4 h-4 mr-2" /> Direct Upload
              </Button>
            } 
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Asset Inventory</CardTitle>
          <CardDescription>Click to manage placement, metadata, and site-wide visibility.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-honey-gold" />
            </div>
          ) : !assets || assets.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              <FileStack className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-serif italic text-lg mb-6">Your media library is empty.</p>
              <Button onClick={handlePullMasterAssets} className="bg-honey-gold text-honey-dark rounded-xl font-bold">
                <RefreshCw className="w-4 h-4 mr-2" /> Sync Master Assets
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-l border-t border-border/50">
              {assets.map((asset: any) => (
                <div 
                  key={asset.id} 
                  onClick={() => setSelectedAsset(asset)}
                  className="relative aspect-square rounded-none overflow-hidden group bg-white border-r border-b border-border/50 cursor-pointer"
                >
                  <Image src={asset.url} alt={asset.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start">
                       <Badge className={cn(
                         "text-[7px] font-bold uppercase",
                         asset.status === 'public' ? "bg-green-500" : "bg-muted text-muted-foreground"
                       )}>
                         {asset.status || 'PRIVATE'}
                       </Badge>
                       <div className="p-1.5 rounded-lg bg-white/10 text-white border border-white/20">
                          <Eye className="w-3 h-3" />
                       </div>
                    </div>
                    <div className="flex justify-between items-end gap-2">
                       <p className="text-[10px] text-white font-bold truncate uppercase tracking-widest flex-1">{asset.name}</p>
                       {asset.featured && <div className="w-4 h-4 rounded-full bg-honey-gold flex items-center justify-center text-honey-dark shadow-lg shrink-0"><Sparkles className="w-2.5 h-2.5" /></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 border-none rounded-[2.5rem] overflow-hidden bg-white shadow-2xl">
          <div className="h-2 bg-honey-gold shrink-0" />
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            <div className="lg:flex-1 bg-muted/20 relative min-h-[300px] overflow-hidden">
              {selectedAsset && (
                <Image src={selectedAsset.url} alt="" fill className="object-contain p-8" />
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-white/80 backdrop-blur-md text-honey-dark font-bold px-3 py-1 text-[10px]">
                   {selectedAsset?.mimeType || 'IMAGE/JPEG'}
                </Badge>
                {selectedAsset?.featured && (
                  <Badge className="bg-honey-gold text-honey-dark font-bold px-3 py-1 text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> FEATURED
                  </Badge>
                )}
              </div>
            </div>

            <div className="lg:w-[380px] flex flex-col border-l bg-white overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                <DialogHeader>
                  <div className="flex items-center gap-2 text-honey-gold mb-1">
                    <Settings2 className="w-4 h-4" />
                    <span className="text-[10px] font-space font-bold uppercase tracking-[0.3em]">Asset Inspector</span>
                  </div>
                  <DialogTitle className="text-2xl font-headline font-bold truncate">{selectedAsset?.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleUpdateAsset} className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visibility</Label>
                        <Select name="status" defaultValue={selectedAsset?.status || "public"}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-green-500" />
                                <span>Public (Visible on site)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="private">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-amber-500" />
                                <span>Private (Hidden)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reference Name</Label>
                        <Input name="name" defaultValue={selectedAsset?.name} className="h-11 rounded-xl" />
                      </div>
                   </div>
                   <Button type="submit" className="w-full bg-muted text-foreground hover:bg-honey-gold hover:text-white rounded-xl h-11 font-bold">
                      <Save className="w-4 h-4 mr-2" /> Save Metadata
                   </Button>
                </form>

                <Separator />

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Compass className="w-3 h-3 text-honey-gold" /> Placement Control
                   </h4>
                   
                   <div className="p-4 rounded-2xl bg-primary text-white flex justify-between items-center group cursor-pointer hover:bg-primary/90 transition-all shadow-lg" onClick={() => handlePromoteToHero(selectedAsset)}>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-honey-gold">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                           <p className="text-xs font-bold">Promote to Hero</p>
                           <p className="text-[8px] opacity-40 uppercase tracking-widest">Homepage rotation</p>
                        </div>
                     </div>
                     {placementLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 opacity-40 group-hover:opacity-100" />}
                   </div>

                   <div className="p-4 rounded-2xl bg-secondary text-white flex justify-between items-center group cursor-pointer hover:bg-secondary/90 transition-all shadow-lg" onClick={() => handlePromoteToGallery(selectedAsset)}>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                           <p className="text-xs font-bold">Promote to Gallery</p>
                           <p className="text-[8px] opacity-40 uppercase tracking-widest">Featured Highlights</p>
                        </div>
                     </div>
                     {placementLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 opacity-40 group-hover:opacity-100" />}
                   </div>
                </div>
              </div>

              <div className="p-8 border-t bg-muted/30 shrink-0 flex justify-between items-center gap-3">
                 <Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl px-4 flex-1 font-bold" onClick={() => handleDelete(selectedAsset.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
                 <a href={selectedAsset?.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-border">
                       <ExternalLink className="w-3 h-3 mr-2" /> Source
                    </Button>
                 </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
