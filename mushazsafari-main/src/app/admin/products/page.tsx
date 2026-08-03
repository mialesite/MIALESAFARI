"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { 
  collection, query, orderBy, deleteDoc, doc, 
  updateDoc, serverTimestamp, setDoc, writeBatch, getDocs, where 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Edit, Search, Loader2, Compass, 
  MoreVertical, CheckCircle2, MapPin, Clock, 
  DollarSign, Image as ImageIcon, List, 
  ShieldCheck, Globe, Zap, Settings2, Sparkles,
  ChevronRight, ChevronLeft, PlusCircle, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import { TOURS } from "@/lib/tours";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

const TOUR_TYPES = ["Luxury", "Mid-range", "Budget", "Camping", "Family", "Fly-in", "Honeymoon", "Photography", "Migration"];
const DIFFICULTY = ["Easy", "Moderate", "Challenging"];
const INCLUSIONS = ["Accommodation", "Breakfast", "Lunch", "Dinner", "Park Fees", "Safari Guide", "Private Vehicle", "Airport Transfers", "Drinking Water", "Domestic Flights"];
const EXCLUSIONS = ["International Flights", "Visa Fees", "Insurance", "Tips", "Laundry", "Alcohol", "Balloon Safari", "Night Game Drives", "Personal Expenses", "Premium Drinks"];

export default function ItineraryCMS() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    tagline: "",
    shortDescription: "",
    overview: "",
    durationDays: 7,
    durationNights: 6,
    priceFrom: 0,
    tourType: "Luxury",
    difficulty: "Moderate",
    bestSeason: "Year-round",
    status: "active",
    featured: false,
    heroImage: "",
    gallery: [],
    destinations: [], // Array of IDs
    highlights: [], // { title, icon }
    timeline: [], // { day, title, desc, destination }
    included: [],
    excluded: [],
    pricingNotes: "",
    ctaText: "Enquire Now",
    trustBadges: [
      { title: "Secure Planning", desc: "Expert logistics from Arusha" },
      { title: "Elite Guiding", desc: "Native Tanzanian specialists" }
    ],
    seo: { title: "", description: "" }
  });

  // Data Subscriptions
  const itinerariesQuery = useMemoFirebase(() => 
    user ? query(collection(db, "itineraries"), orderBy("createdAt", "desc")) : null, 
    [db, user]
  );
  const { data: itineraries, loading } = useCollection(itinerariesQuery);

  const destinationsQuery = useMemoFirebase(() => collection(db, "destinations"), [db]);
  const { data: allDestinations } = useCollection(destinationsQuery);

  const filtered = itineraries?.filter(i => 
    i.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync Logic
  const handleRestoreSignatures = async () => {
    if (!confirm("Restore the complete Miale signature collection? Existing slugs will be skipped.")) return;
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
        toast({ title: "Signatures Restored", description: `Imported ${count} expeditions.` });
      } else {
        toast({ title: "Catalog Current" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ variant: "destructive", title: "Title Required" });
      return;
    }
    setSaving(true);
    const docRef = editingId ? doc(db, "itineraries", editingId) : doc(collection(db, "itineraries"));
    const data = {
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      updatedAt: serverTimestamp(),
      createdAt: formData.createdAt || serverTimestamp(),
    };

    try {
      await setDoc(docRef, data, { merge: true });
      toast({ title: "Itinerary Synced", description: `${formData.title} is now live.` });
      setIsDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error Saving" });
    } finally {
      setSaving(false);
    }
  };

  const openEditor = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        slug: "",
        tagline: "Where Elegance encounters The Wild.",
        shortDescription: "",
        overview: "",
        durationDays: 7,
        durationNights: 6,
        priceFrom: 2500,
        tourType: "Luxury",
        difficulty: "Moderate",
        bestSeason: "Year-round",
        status: "active",
        featured: false,
        heroImage: "",
        gallery: [],
        destinations: [],
        highlights: [{ title: "Big Five Tracking", icon: "Zap" }],
        timeline: [{ day: 1, title: "Arrival", desc: "Welcome to Arusha.", destination: "Arusha" }],
        included: ["Park Fees", "Safari Guide"],
        excluded: ["International Flights"],
        pricingNotes: "Rates are based on twin-share elite occupancy.",
        ctaText: "Enquire Now",
        trustBadges: [{ title: "Secure Planning", desc: "Bespoke protection" }],
        seo: { title: "", description: "" }
      });
    }
    setActiveStep("basic");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently remove this expedition?")) return;
    try {
      await deleteDoc(doc(db, "itineraries", id));
      toast({ title: "Expedition Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'draft' : 'active';
    try {
      await updateDoc(doc(db, "itineraries", id), { status: next });
      toast({ title: "Visibility Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-gradient">Itineraries Hub</h1>
          <p className="text-muted-foreground">The master catalog for Miale's website expeditions.</p>
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
          <Button variant="outline" onClick={handleRestoreSignatures} disabled={seeding} className="border-honey-gold text-honey-gold rounded-xl h-12 px-6 font-bold">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            Restore Signatures
          </Button>
          <Button onClick={() => openEditor()} className="bg-primary text-white rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Itinerary
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Expedition Selection</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Rate (USD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-60 text-center text-muted-foreground italic">No itineraries registered.</TableCell></TableRow>
            ) : (
              filtered?.map((item: any) => (
                <TableRow key={item.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border">
                        {item.heroImage || item.featuredImage ? (
                          <Image src={item.heroImage || item.featuredImage} alt="" fill className="object-cover" />
                        ) : <ImageIcon className="w-4 h-4 m-auto opacity-20" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-space tracking-widest">{item.durationDays} Days / {item.durationNights} Nights</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] uppercase font-bold text-secondary">{item.tourType}</Badge></TableCell>
                  <TableCell className="font-bold text-primary">${item.priceFrom?.toLocaleString()}</TableCell>
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
            <DialogTitle>Itinerary CMS Editor</DialogTitle>
            <DialogDescription>
              Comprehensive management interface for creating and publishing luxury safari expeditions.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-muted/20 hidden md:flex flex-col p-8 space-y-2 shrink-0">
               <div className="flex items-center gap-3 mb-8 text-primary">
                 <Compass className="w-6 h-6" />
                 <span className="font-headline font-bold text-lg">Editor</span>
               </div>
               {[
                 { id: "basic", label: "Basic Info", icon: Settings2 },
                 { id: "media", label: "Hero & Media", icon: ImageIcon },
                 { id: "summary", label: "Tour Summary", icon: Clock },
                 { id: "route", label: "Destinations", icon: MapPin },
                 { id: "timeline", label: "Timeline", icon: List },
                 { id: "extras", label: "Included", icon: CheckCircle2 },
                 { id: "pricing", label: "Pricing & CTA", icon: DollarSign },
                 { id: "seo", label: "SEO & Trust", icon: Globe },
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
                  <div className="p-4 bg-honey-gold/10 rounded-2xl border border-honey-gold/20">
                     <p className="text-[10px] font-black uppercase text-honey-gold mb-1">Live Status</p>
                     <p className="text-xs font-bold capitalize">{formData.status}</p>
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <ScrollArea className="flex-1">
                <div className="p-8 md:p-12 space-y-12">
                  
                  {/* 1. Basic Info */}
                  <section className={cn("space-y-8", activeStep !== "basic" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">General Identity</h2>
                      <p className="text-muted-foreground text-sm">The primary branding and descriptive hooks for the itinerary.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Itinerary Title</Label>
                          <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">URL Slug</Label>
                          <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="auto-generated" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tagline Teaser</Label>
                          <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="h-12 rounded-xl italic" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Short Description (Marketing Hook)</Label>
                          <textarea 
                            value={formData.shortDescription} 
                            onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                            className="w-full min-h-[100px] p-4 rounded-xl border focus:ring-1 focus:ring-primary outline-none transition-all text-sm leading-relaxed" 
                          />
                        </div>
                    </div>
                  </section>

                  {/* 2. Media */}
                  <section className={cn("space-y-8", activeStep !== "media" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Photography & Video</h2>
                      <p className="text-muted-foreground text-sm">Cinematic assets that define the wilderness experience.</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Hero Background</Label>
                      <div className="flex items-center gap-6 p-8 bg-muted/10 rounded-[2.5rem] border-2 border-dashed">
                        {formData.heroImage ? (
                          <div className="relative w-64 h-36 rounded-2xl overflow-hidden shadow-2xl group border bg-white">
                            <Image src={formData.heroImage} alt="" fill className="object-cover" />
                            <button onClick={() => setFormData({...formData, heroImage: ""})} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X className="w-8 h-8" /></button>
                          </div>
                        ) : <div className="w-64 h-36 bg-white rounded-2xl flex items-center justify-center border shadow-inner"><ImageIcon className="w-10 h-10 opacity-10" /></div>}
                        <MediaLibraryDialog onSelect={(url) => setFormData({...formData, heroImage: url})} trigger={<Button variant="outline" className="h-12 rounded-xl px-8 font-bold border-primary text-primary">Library</Button>} />
                      </div>
                    </div>
                  </section>

                  {/* 3. Tour Summary */}
                  <section className={cn("space-y-8", activeStep !== "summary" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Technical Metrics</h2>
                      <p className="text-muted-foreground text-sm">Duration, difficulty, and seasonal availability.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Duration (Days)</Label>
                        <Input type="number" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tour Category</Label>
                        <Select value={formData.tourType} onValueChange={v => setFormData({...formData, tourType: v})}>
                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {TOUR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Best Season</Label>
                        <Input value={formData.bestSeason} onChange={e => setFormData({...formData, bestSeason: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                  </section>

                  {/* 4. Destinations */}
                  <section className={cn("space-y-8", activeStep !== "route" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Relational Route</h2>
                      <p className="text-muted-foreground text-sm">Select landmarks from your master destination registry.</p>
                    </div>
                    <div className="p-8 bg-muted/10 rounded-[2.5rem] border border-muted/50 max-h-[500px] overflow-y-auto">
                      <div className="flex flex-wrap gap-3 mb-8">
                        {formData.destinations.map((id: string) => {
                          const d = allDestinations?.find(dest => dest.id === id);
                          return (
                            <Badge key={id} className="bg-primary text-white h-10 px-4 gap-2 rounded-xl text-xs font-bold">
                              {d?.name || 'Unknown'}
                              <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({...formData, destinations: formData.destinations.filter((dId: string) => dId !== id)})} />
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allDestinations?.filter(d => !formData.destinations.includes(d.id)).map(d => (
                          <button 
                            key={d.id}
                            onClick={() => setFormData({...formData, destinations: [...formData.destinations, d.id]})}
                            className="p-4 bg-white rounded-2xl border hover:border-primary transition-all text-xs font-bold text-left flex items-center gap-2"
                          >
                            <PlusCircle className="w-4 h-4 text-primary" /> {d.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* 5. Timeline Builder */}
                  <section className={cn("space-y-8", activeStep !== "timeline" && "hidden")}>
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-headline font-bold">Journey Timeline</h2>
                        <p className="text-muted-foreground text-sm">Day-by-day narrative and activity planning.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, timeline: [...formData.timeline, { day: formData.timeline.length + 1, title: "", desc: "" }]})} variant="outline" className="rounded-xl border-primary text-primary h-11 px-6 font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Day
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {formData.timeline.map((day: any, idx: number) => (
                        <div key={idx} className="p-8 bg-muted/5 rounded-[2.5rem] border border-muted/50 group relative">
                          <button onClick={() => setFormData({...formData, timeline: formData.timeline.filter((_:any, i:number) => i !== idx)})} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-1">
                              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black">
                                  {idx + 1}
                              </div>
                            </div>
                            <div className="md:col-span-11 space-y-6">
                                <Input 
                                  placeholder="Day Heading (e.g. Serengeti Plains)" 
                                  value={day.title} 
                                  onChange={e => {
                                    const newTl = [...formData.timeline];
                                    newTl[idx].title = e.target.value;
                                    setFormData({...formData, timeline: newTl});
                                  }}
                                  className="h-12 rounded-xl text-lg font-bold border-none bg-white/50 px-0 shadow-none focus-visible:ring-0" 
                                />
                                <textarea 
                                  placeholder="What will the traveler discover today?"
                                  value={day.desc}
                                  onChange={e => {
                                    const newTl = [...formData.timeline];
                                    newTl[idx].desc = e.target.value;
                                    setFormData({...formData, timeline: newTl});
                                  }}
                                  className="w-full min-h-[120px] bg-transparent border-none outline-none text-sm leading-relaxed text-muted-foreground"
                                />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 6. Pricing & Extras */}
                  <section className={cn("space-y-8", activeStep !== "extras" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">The Fine Print</h2>
                      <p className="text-muted-foreground text-sm">Define inclusions and exclusions for the booking brief.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">What's Included</Label>
                      <div className="flex flex-wrap gap-2">
                          {INCLUSIONS.map(inc => (
                            <button
                              key={inc}
                              onClick={() => setFormData({...formData, included: formData.included.includes(inc) ? formData.included.filter((i:string) => i !== inc) : [...formData.included, inc]})}
                              className={cn(
                                "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                                formData.included.includes(inc) ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground"
                              )}
                            >
                              {inc}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">What's Excluded</Label>
                      <div className="flex flex-wrap gap-2">
                          {EXCLUSIONS.map(exc => (
                            <button
                              key={exc}
                              onClick={() => setFormData({...formData, excluded: formData.excluded.includes(exc) ? formData.excluded.filter((i:string) => i !== exc) : [...formData.excluded, exc]})}
                              className={cn(
                                "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                                formData.excluded.includes(exc) ? "bg-accent text-white border-accent" : "bg-white text-muted-foreground"
                              )}
                            >
                              {exc}
                            </button>
                          ))}
                      </div>
                    </div>
                  </section>

                  {/* 7. Pricing & CTA */}
                  <section className={cn("space-y-8", activeStep !== "pricing" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Financials & CTA</h2>
                      <p className="text-muted-foreground text-sm">Control the visitor's entry point and investment level.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price Start (USD)</Label>
                          <Input type="number" value={formData.priceFrom} onChange={e => setFormData({...formData, priceFrom: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">CTA Button Label</Label>
                          <Input value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pricing Context Notes</Label>
                          <textarea value={formData.pricingNotes} onChange={e => setFormData({...formData, pricingNotes: e.target.value})} className="w-full min-h-[100px] p-4 rounded-xl border focus:ring-1 focus:ring-primary outline-none text-sm" />
                      </div>
                    </div>
                  </section>

                  {/* 8. SEO */}
                  <section className={cn("space-y-8", activeStep !== "seo" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Public Presence</h2>
                      <p className="text-muted-foreground text-sm">Search engine optimization and administrative status.</p>
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
                        <div className="grid grid-cols-2 gap-8 pt-8">
                          <div className="p-6 bg-muted/10 rounded-3xl border flex items-center justify-between">
                              <Label className="font-bold text-sm">Featured Itinerary</Label>
                              <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-6 h-6 accent-primary" />
                          </div>
                          <div className="p-6 bg-muted/10 rounded-3xl border flex items-center justify-between">
                              <Label className="font-bold text-sm">Status</Label>
                              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                <SelectTrigger className="w-32 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="active">Published</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                        </div>
                    </div>
                  </section>

                </div>
              </ScrollArea>

              {/* Wizard Footer */}
              <div className="p-8 border-t bg-muted/10 flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8 font-bold">Discard</Button>
                   <Button variant="outline" onClick={() => handleSave()} disabled={saving} className="rounded-xl h-12 px-8 font-bold border-muted">Save as Draft</Button>
                 </div>
                 <div className="flex gap-3">
                   <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-primary text-white rounded-xl h-12 px-12 font-bold shadow-xl shadow-primary/20"
                   >
                     {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                     {editingId ? "Update Itinerary" : "Publish Itinerary"}
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
