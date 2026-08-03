"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { 
  collection, query, orderBy, deleteDoc, doc, 
  updateDoc, serverTimestamp, writeBatch, setDoc, getDocs, where 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Edit, Search, Loader2, MapPin, 
  MoreVertical, Globe, CheckCircle2, RefreshCw,
  Settings2, ImageIcon, Info, List, BarChart3,
  Link2, Sparkles, X, PlusCircle, Compass, Zap
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { getImageById } from "@/app/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const CIRCUITS = ["Northern Circuit", "Southern Circuit", "Western Frontiers", "Zanzibar & Islands", "The Peaks"];

export default function DestinationCMS() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    circuit: "Northern Circuit",
    type: "Wildlife Sanctuary",
    distance: "",
    shortDescription: "",
    description: "",
    featuredImage: "",
    gallery: [],
    status: "active",
    discovery: {
      title: "The Discovery",
      text: ""
    },
    facts: [
      { title: "Ecosystem", icon: "Trees", description: "" },
      { title: "Wildlife", icon: "Zap", description: "" }
    ],
    statistics: {
      area: "",
      elevation: "",
      established: "",
      unesco: "No",
      bestTime: "",
      climate: ""
    },
    relatedCircuits: ["Northern Circuit"],
    manualItineraries: [],
    seo: { title: "", description: "" }
  });

  // Data Subscriptions
  const destinationsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "destinations"), orderBy("createdAt", "desc")) : null,
    [db, user]
  );
  const { data: destinations, loading } = useCollection(destinationsQuery);

  const itinerariesQuery = useMemoFirebase(() => collection(db, "itineraries"), [db]);
  const { data: allItineraries } = useCollection(itinerariesQuery);

  const filtered = destinations?.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.circuit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditor = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        ...formData,
        ...item,
        discovery: item.discovery || { title: "The Discovery", text: "" },
        facts: item.facts || [],
        statistics: item.statistics || { area: "", elevation: "", established: "", unesco: "No", bestTime: "", climate: "" },
        relatedCircuits: item.relatedCircuits || [item.circuit],
        manualItineraries: item.manualItineraries || []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        circuit: "Northern Circuit",
        type: "Wildlife Sanctuary",
        distance: "",
        shortDescription: "The Endless Plains of the Apex Wilderness.",
        description: "",
        featuredImage: "",
        gallery: [],
        status: "active",
        discovery: { title: "The Discovery", text: "" },
        facts: [
          { title: "Ecosystem", icon: "Trees", description: "Diverse habitats from open plains to riverine forests." },
          { title: "Wildlife", icon: "Zap", description: "Highest concentration of large mammals on earth." }
        ],
        statistics: { area: "", elevation: "", established: "", unesco: "No", bestTime: "June to October", climate: "Tropical" },
        relatedCircuits: ["Northern Circuit"],
        manualItineraries: [],
        seo: { title: "", description: "" }
      });
    }
    setActiveStep("identity");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ variant: "destructive", title: "Name Required" });
      return;
    }
    setSaving(true);
    const docRef = editingId ? doc(db, "destinations", editingId) : doc(collection(db, "destinations"));
    
    const data = {
      ...formData,
      updatedAt: serverTimestamp(),
      createdAt: formData.createdAt || serverTimestamp(),
    };

    try {
      await setDoc(docRef, data, { merge: true });
      toast({ title: "Landmark Synced", description: `${formData.name} identity is now live.` });
      setIsDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this landmark from the active registry?")) return;
    try {
      await deleteDoc(doc(db, "destinations", id));
      toast({ title: "Landmark Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleSeed = async () => {
    if (!confirm("Restore master landmarks? Existing names will be updated.")) return;
    setSeeding(true);
    const batch = writeBatch(db);
    try {
      for (const master of MASTER_DESTINATIONS) {
        const existing = destinations?.find(d => d.name === master.name);
        const imgData = getImageById(master.imageId);
        const docRef = existing ? doc(db, "destinations", existing.id) : doc(collection(db, "destinations"));
        
        batch.set(docRef, {
          ...master,
          featuredImage: imgData.imageUrl,
          status: "active",
          createdAt: existing?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();
      toast({ title: "Destinations Restored", description: "Master registry has been synchronized." });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSeeding(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'draft' : 'active';
    try {
      await updateDoc(doc(db, "destinations", id), { status: next });
      toast({ title: "Visibility Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-gradient">Landmarks Registry</h1>
          <p className="text-muted-foreground">Authoritative content management for Tanzanian destinations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search landmarks..." 
              className="pl-10 h-12 w-64 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleSeed} disabled={seeding} className="border-honey-gold text-honey-gold rounded-xl h-12 px-6 font-bold">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Restore Master
          </Button>
          <Button onClick={() => openEditor()} className="bg-primary text-white rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Landmark
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Landmark Identity</TableHead>
              <TableHead>Circuit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-60 text-center text-muted-foreground italic">No landmarks registered.</TableCell></TableRow>
            ) : (
              filtered?.map((item: any) => (
                <TableRow key={item.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border">
                        {item.featuredImage ? (
                          <img src={item.featuredImage} alt="" className="object-cover w-full h-full" />
                        ) : <ImageIcon className="w-4 h-4 m-auto opacity-20" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-space tracking-widest">{item.circuit}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] uppercase font-bold text-secondary">{item.circuit}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">{item.type}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none">
                          <Badge className={cn(
                            "font-bold uppercase text-[9px] px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity",
                            item.status === 'active' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {item.status === 'active' ? 'PUBLIC' : 'DRAFT'}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-xl">
                        <DropdownMenuItem onSelect={() => toggleStatus(item.id, item.status)}>
                          {item.status === 'active' ? "Move to Draft (Hide)" : "Make Public (Live)"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-full" onClick={() => openEditor(item)}>
                         <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive rounded-full" onClick={() => handleDelete(item.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl h-[92vh] p-0 border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
          <div className="h-1.5 bg-primary shrink-0" />
          <DialogHeader className="sr-only">
            <DialogTitle>Landmark CMS Editor</DialogTitle>
            <DialogDescription>Structured content management for Tanzanian destinations.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-muted/20 hidden md:flex flex-col p-8 space-y-2 shrink-0">
               <div className="flex items-center gap-3 mb-8 text-primary">
                 <MapPin className="w-6 h-6" />
                 <span className="font-headline font-bold text-lg">Landmark</span>
               </div>
               {[
                 { id: "identity", label: "Identity", icon: Settings2 },
                 { id: "media", label: "Media Gallery", icon: ImageIcon },
                 { id: "discovery", label: "The Discovery", icon: Info },
                 { id: "facts", label: "Key Facts", icon: List },
                 { id: "stats", label: "Quick Stats", icon: BarChart3 },
                 { id: "relations", label: "Relationships", icon: Link2 },
                 { id: "seo", label: "SEO & FAQ", icon: Globe },
               ].map(step => (
                 <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                    activeStep === step.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                  )}
                 >
                   <step.icon className="w-4 h-4" />
                   {step.label}
                 </button>
               ))}
               <div className="mt-auto pt-8 border-t">
                  <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                     <p className="text-[10px] font-black uppercase text-green-600 mb-1">Status</p>
                     <p className="text-xs font-bold capitalize">{formData.status}</p>
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <ScrollArea className="flex-1">
                <div className="p-8 md:p-12 space-y-12">
                  
                  {/* 1. Identity */}
                  <section className={cn("space-y-8", activeStep !== "identity" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Landmark Identity</h2>
                      <p className="text-muted-foreground text-sm">Primary classification and branding.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Landmark Name</Label>
                          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Primary Circuit</Label>
                          <Select value={formData.circuit} onValueChange={v => setFormData({...formData, circuit: v})}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {CIRCUITS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Destination Tagline</Label>
                          <Input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="h-12 rounded-xl italic" />
                        </div>
                        <div className="grid grid-cols-2 gap-8 md:col-span-2">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Landmark Type</Label>
                            <Input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. National Park" className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Accessibility (Distance)</Label>
                            <Input value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} placeholder="e.g. 180km from Arusha" className="h-12 rounded-xl" />
                          </div>
                        </div>
                    </div>
                  </section>

                  {/* 2. Media */}
                  <section className={cn("space-y-8", activeStep !== "media" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Cinematic Media</h2>
                      <p className="text-muted-foreground text-sm">Visual assets that represent the landmark identity.</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Featured Photography</Label>
                      <div className="flex items-center gap-6 p-8 bg-muted/10 rounded-[2.5rem] border-2 border-dashed">
                        {formData.featuredImage ? (
                          <div className="relative w-64 h-36 rounded-2xl overflow-hidden shadow-2xl group border bg-white">
                            <img src={formData.featuredImage} alt="" className="object-cover w-full h-full" />
                            <button onClick={() => setFormData({...formData, featuredImage: ""})} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X className="w-8 h-8" /></button>
                          </div>
                        ) : <div className="w-64 h-36 bg-white rounded-2xl flex items-center justify-center border shadow-inner"><ImageIcon className="w-10 h-10 opacity-10" /></div>}
                        <MediaLibraryDialog onSelect={(url) => setFormData({...formData, featuredImage: url})} trigger={<Button variant="outline" className="h-12 rounded-xl px-8 font-bold border-primary text-primary">Open Library</Button>} />
                      </div>
                    </div>
                  </section>

                  {/* 3. Discovery */}
                  <section className={cn("space-y-8", activeStep !== "discovery" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">The Discovery Section</h2>
                      <p className="text-muted-foreground text-sm">The primary narrative for the destination page.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Section Heading</Label>
                          <Input value={formData.discovery.title} onChange={e => setFormData({...formData, discovery: {...formData.discovery, title: e.target.value}})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Full Discovery Narrative</Label>
                          <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            className="w-full min-h-[250px] p-6 rounded-2xl border bg-muted/5 focus:ring-1 focus:ring-primary outline-none transition-all text-sm leading-relaxed" 
                            placeholder="Tell the story of this landmark..."
                          />
                        </div>
                    </div>
                  </section>

                  {/* 4. Facts */}
                  <section className={cn("space-y-8", activeStep !== "facts" && "hidden")}>
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-headline font-bold">Landmark Facts</h2>
                        <p className="text-muted-foreground text-sm">Unique characteristics presented as elegant cards.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, facts: [...formData.facts, { title: "", icon: "Zap", description: "" }]})} variant="outline" className="rounded-xl border-primary text-primary h-11 px-6 font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Fact Card
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {formData.facts.map((fact: any, idx: number) => (
                          <div key={idx} className="p-8 bg-muted/5 rounded-[2.5rem] border group relative flex gap-8">
                            <button onClick={() => setFormData({...formData, facts: formData.facts.filter((_:any, i:number) => i !== idx)})} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><List className="w-5 h-5" /></div>
                            <div className="flex-1 space-y-4">
                                <Input placeholder="Fact Heading (e.g. Ecosystem)" value={fact.title} onChange={e => {
                                  const newFacts = [...formData.facts];
                                  newFacts[idx].title = e.target.value;
                                  setFormData({...formData, facts: newFacts});
                                }} className="h-10 text-lg font-bold border-none shadow-none bg-transparent px-0" />
                                <textarea placeholder="Fact details..." value={fact.description} onChange={e => {
                                  const newFacts = [...formData.facts];
                                  newFacts[idx].description = e.target.value;
                                  setFormData({...formData, facts: newFacts});
                                }} className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground resize-none" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* 5. Statistics */}
                  <section className={cn("space-y-8", activeStep !== "stats" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Quick Statistics</h2>
                      <p className="text-muted-foreground text-sm">Technical data for the information grid.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {["area", "elevation", "established", "unesco", "bestTime", "climate"].map((field) => (
                          <div key={field} className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                            <Input 
                              value={formData.statistics[field]} 
                              onChange={e => setFormData({...formData, statistics: {...formData.statistics, [field]: e.target.value}})} 
                              className="h-12 rounded-xl" 
                            />
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* 6. Relations */}
                  <section className={cn("space-y-8", activeStep !== "relations" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Relationships</h2>
                      <p className="text-muted-foreground text-sm">Cross-link with itineraries and safari circuits.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Safaris Visiting This Landmark</Label>
                        <div className="p-8 bg-muted/5 rounded-[2.5rem] border max-h-[300px] overflow-y-auto no-scrollbar">
                          <div className="flex flex-wrap gap-2 mb-6">
                              {formData.manualItineraries.map((id: string) => {
                                const i = allItineraries?.find(itin => itin.id === id);
                                return (
                                  <Badge key={id} className="bg-primary text-white h-10 px-4 gap-2 rounded-xl text-xs">
                                    {i?.title || 'Expedition'}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({...formData, manualItineraries: formData.manualItineraries.filter((mId:string) => mId !== id)})} />
                                  </Badge>
                                );
                              })}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              {allItineraries?.filter(i => !formData.manualItineraries.includes(i.id)).map(i => (
                                <button key={i.id} onClick={() => setFormData({...formData, manualItineraries: [...formData.manualItineraries, i.id]})} className="p-3 bg-white rounded-xl border hover:border-primary text-left text-xs font-bold flex items-center gap-2">
                                  <PlusCircle className="w-4 h-4 text-primary" /> {i.title}
                                </button>
                              ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Note: If no manual itineraries are chosen, the system will automatically display all tours that include this destination in their route.</p>
                    </div>
                  </section>

                  {/* 7. SEO */}
                  <section className={cn("space-y-8", activeStep !== "seo" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Public Presence</h2>
                      <p className="text-muted-foreground text-sm">Search visibility and metadata.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Meta Title</Label>
                          <Input value={formData.seo.title} onChange={e => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Meta Description</Label>
                          <textarea value={formData.seo.description} onChange={e => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})} className="w-full min-h-[100px] p-4 rounded-xl border text-sm" />
                        </div>
                    </div>
                  </section>

                </div>
              </ScrollArea>

              {/* Wizard Footer */}
              <div className="p-8 border-t bg-muted/10 flex justify-between items-center shrink-0">
                 <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8 font-bold">Discard</Button>
                 <div className="flex gap-3">
                   <Button variant="outline" onClick={() => handleSave()} disabled={saving} className="rounded-xl h-12 px-8 font-bold border-muted">Save as Draft</Button>
                   <Button onClick={handleSave} disabled={saving} className="bg-primary text-white rounded-xl h-12 px-12 font-bold shadow-xl shadow-primary/20">
                     {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                     {editingId ? "Update Landmark" : "Publish Landmark"}
                   </Button>
                 </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
