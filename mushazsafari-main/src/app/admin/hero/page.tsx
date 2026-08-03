"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2, CheckCircle2, X, Eye, ExternalLink, Play, ChevronLeft, ChevronRight, Settings2, Layout, Maximize, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

function MiniHeroPreview({ slides }: { slides: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-safari-charcoal relative h-[450px] rounded-[2.5rem]">
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              className={cn("transition-all duration-1000", slide.imageFit || "object-cover")}
              style={{ 
                filter: `brightness(${1 - (slide.opacity || 0.4)})`,
                objectPosition: slide.imagePosition || "center"
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-safari-charcoal/60" />
      </div>

      <div className={cn(
        "relative z-10 h-full flex flex-col p-8 md:p-16",
        slide.contentPosition === "top-left" && "items-start justify-start text-left",
        slide.contentPosition === "top-right" && "items-end justify-start text-right",
        slide.contentPosition === "bottom-left" && "items-start justify-end text-left",
        slide.contentPosition === "bottom-right" && "items-end justify-end text-right",
        (!slide.contentPosition || slide.contentPosition === "center") && "items-center justify-center text-center"
      )}>
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className={cn(
            "font-serif text-white mb-6 leading-[0.95] tracking-tighter drop-shadow-lg",
            slide.titleSize || "text-5xl md:text-7xl"
          )}>
            {slide.title}
          </h1>
          <p className={cn(
            "text-white/80 font-light mb-8 max-w-2xl line-clamp-3",
            slide.subtitleSize || "text-sm md:text-lg"
          )}>
            {slide.subtitle}
          </p>
          <div className={cn(
            "flex gap-4",
            (!slide.contentPosition || slide.contentPosition === "center") ? "justify-center" : 
            (slide.contentPosition.includes("right") ? "justify-end" : "justify-start")
          )}>
            <Button size="lg" className="rounded-full bg-honey-gold text-honey-dark font-bold uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-honey-gold/20">
              {slide.buttonText || "Plan My Safari"}
              <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1 rounded-full transition-all duration-500", 
              i === current ? "w-8 bg-honey-gold" : "w-1.5 bg-white/30"
            )} 
          />
        ))}
      </div>
      
      <div className="absolute top-8 right-8 z-20">
        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md font-space font-bold text-[8px] uppercase tracking-widest px-3 py-1">
          Dynamic Visual Engine Active
        </Badge>
      </div>
    </Card>
  );
}

export default function HeroImagesManager() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const slidesQuery = useMemoFirebase(() => 
    query(collection(db, "hero_slides"), orderBy("priority", "asc")), 
    [db]
  );
  const { data: slides, loading } = useCollection(slidesQuery);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "Plan My Safari",
    buttonLink: "/contact",
    imageUrl: "",
    opacity: 0.6,
    priority: 0,
    status: "active",
    titleSize: "text-5xl md:text-7xl",
    subtitleSize: "text-sm md:text-lg",
    contentPosition: "center",
    imageFit: "object-cover",
    imagePosition: "center",
  });

  useEffect(() => {
    if (editingSlide) {
      setFormData({
        title: editingSlide.title || "",
        subtitle: editingSlide.subtitle || "",
        buttonText: editingSlide.buttonText || "Plan My Safari",
        buttonLink: editingSlide.buttonLink || "/contact",
        imageUrl: editingSlide.imageUrl || "",
        opacity: editingSlide.opacity || 0.6,
        priority: editingSlide.priority || 0,
        status: editingSlide.status || "active",
        titleSize: editingSlide.titleSize || "text-5xl md:text-7xl",
        subtitleSize: editingSlide.subtitleSize || "text-sm md:text-lg",
        contentPosition: editingSlide.contentPosition || "center",
        imageFit: editingSlide.imageFit || "object-cover",
        imagePosition: editingSlide.imagePosition || "center",
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        buttonText: "Plan My Safari",
        buttonLink: "/contact",
        imageUrl: "",
        opacity: 0.6,
        priority: 0,
        status: "active",
        titleSize: "text-5xl md:text-7xl",
        subtitleSize: "text-sm md:text-lg",
        contentPosition: "center",
        imageFit: "object-cover",
        imagePosition: "center",
      });
    }
  }, [editingSlide]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const docRef = editingSlide?.id ? doc(db, "hero_slides", editingSlide.id) : doc(collection(db, "hero_slides"));

    try {
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: editingSlide?.createdAt || serverTimestamp()
      }, { merge: true });
      
      toast({ title: "Visual Hub Updated", description: "Design changes are now live on the homepage." });
      setIsDialogOpen(false);
      setEditingSlide(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error Saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this slide from rotation?")) return;
    try {
      await deleteDoc(doc(db, "hero_slides", id));
      toast({ title: "Visual Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const activeSlides = slides && slides.filter(s => s.status === 'active').length > 0 
    ? slides.filter(s => s.status === 'active') 
    : [{
        title: "Miale",
        subtitle: "Move beyond the ordinary. Curated luxury expeditions to the heart of the wild.",
        imageUrl: "https://development.orbituniverse.co.tz/uploads/Mushaz%20safaris/Destinations/tanzania-wild-sky-rcGU1VUgLos-unsplash.jpg",
        buttonText: "Plan My Safari",
        buttonLink: "#",
        opacity: 0.6,
        titleSize: "text-5xl md:text-7xl",
        subtitleSize: "text-sm md:text-lg",
        contentPosition: "center",
        imageFit: "object-cover",
        imagePosition: "center",
      }];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-gradient">Hero Slider Hub</h1>
          <p className="text-muted-foreground">High-fidelity WYSIWYG management of homepage cinematic overlays.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-honey-gold text-honey-dark font-bold rounded-xl h-12 px-10 shadow-lg shadow-honey-gold/20">
          <Plus className="w-5 h-5 mr-2" /> Register Visual
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Cinematic Simulation</h3>
          <span className="text-[10px] text-honey-gold font-bold">
            {slides && slides.filter(s => s.status === 'active').length > 0 
              ? `Auto-playing ${activeSlides.length} active visuals` 
              : "Showing Platform Fallback"}
          </span>
        </div>
        <MiniHeroPreview slides={activeSlides} />
      </section>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
           <CardTitle className="text-lg">Visual Registry</CardTitle>
           <CardDescription>Items marked PUBLIC are visible to all visitors on the homepage.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identity</TableHead>
              <TableHead>Heading</TableHead>
              <TableHead>Layout</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : !slides || slides.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">No hero slides registered.</TableCell></TableRow>
            ) : (
              slides.map((s: any) => (
                <TableRow key={s.id} className="group">
                  <TableCell>
                    <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-muted border shadow-sm">
                      {s.imageUrl && <Image src={s.imageUrl} alt="" fill className="object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold max-w-[250px] truncate text-sm">{s.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary" className="text-[8px] uppercase">{s.contentPosition || 'Center'}</Badge>
                       <Badge variant="outline" className="text-[8px] uppercase">{s.imageFit === 'object-contain' ? 'Fit' : 'Fill'}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold uppercase text-[9px]",
                      s.status === 'active' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {s.status === 'active' ? 'PUBLIC' : 'PRIVATE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-full" asChild>
                         <Link href="/" target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setEditingSlide(s); setIsDialogOpen(true); }}>
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive rounded-full" onClick={() => handleDelete(s.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSlide(null); }}>
        <DialogContent className="max-w-[90vw] md:max-w-5xl h-[92vh] p-0 border-none bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="h-1.5 bg-honey-gold shrink-0" />
          
          <div className="flex-1 flex overflow-hidden">
            {/* Design Sidebar */}
            <div className="w-64 border-r bg-muted/20 hidden md:flex flex-col p-8 space-y-2 shrink-0">
               <div className="flex items-center gap-3 mb-8 text-honey-gold">
                 <Settings2 className="w-6 h-6" />
                 <span className="font-headline font-bold text-lg">Visual Hub</span>
               </div>
               {[
                 { id: "content", label: "Copy & Narrative", icon: Play },
                 { id: "typography", label: "Typography", icon: Edit },
                 { id: "layout", label: "Layout & Position", icon: Layout },
                 { id: "assets", label: "Media & Overlay", icon: Maximize },
               ].map(tab => (
                 <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                    activeTab === tab.id ? "bg-honey-gold text-honey-dark shadow-lg" : "text-muted-foreground hover:bg-muted"
                  )}
                 >
                   <tab.icon className="w-4 h-4" />
                   {tab.label}
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
                  
                  {/* 1. Copy & Narrative */}
                  <section className={cn("space-y-8", activeTab !== "content" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Slide Narrative</h2>
                      <p className="text-muted-foreground text-sm">Define the primary branding hooks and action triggers.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Main Heading</Label>
                          <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Serengeti" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Sub-heading Story</Label>
                          <Input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="Bespoke expeditions to the heart of the wild." className="h-12 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">CTA Label</Label>
                            <Input value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">CTA Link</Label>
                            <Input value={formData.buttonLink} onChange={e => setFormData({...formData, buttonLink: e.target.value})} className="h-12 rounded-xl" />
                          </div>
                        </div>
                    </div>
                  </section>

                  {/* 2. Typography */}
                  <section className={cn("space-y-8", activeTab !== "typography" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Typography Scale</h2>
                      <p className="text-muted-foreground text-sm">Control the visual impact of your headings on desktop and mobile.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Heading Size</Label>
                          <Select value={formData.titleSize} onValueChange={v => setFormData({...formData, titleSize: v})}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="text-3xl md:text-5xl">Small (Elegant)</SelectItem>
                               <SelectItem value="text-4xl md:text-6xl">Medium (Standard)</SelectItem>
                               <SelectItem value="text-5xl md:text-7xl">Large (Impact)</SelectItem>
                               <SelectItem value="text-6xl md:text-9xl">Hero (XL Cinematic)</SelectItem>
                               <SelectItem value="text-7xl md:text-[11rem]">Titan (XXL Luxury)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Sub-heading Size</Label>
                          <Select value={formData.subtitleSize} onValueChange={v => setFormData({...formData, subtitleSize: v})}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="text-xs md:text-sm">Small</SelectItem>
                               <SelectItem value="text-sm md:text-lg">Medium (Standard)</SelectItem>
                               <SelectItem value="text-lg md:text-2xl">Large (Narrative)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </section>

                  {/* 3. Layout */}
                  <section className={cn("space-y-8", activeTab !== "layout" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Content Alignment</h2>
                      <p className="text-muted-foreground text-sm">Position your story to perfectly complement the background photography.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Primary Alignment</Label>
                          <Select value={formData.contentPosition} onValueChange={v => setFormData({...formData, contentPosition: v})}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="center">Center Center</SelectItem>
                               <SelectItem value="top-left">Top Left</SelectItem>
                               <SelectItem value="top-right">Top Right</SelectItem>
                               <SelectItem value="bottom-left">Bottom Left</SelectItem>
                               <SelectItem value="bottom-right">Bottom Right</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Display Rank (Order)</Label>
                          <Input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                       </div>
                    </div>
                  </section>

                  {/* 4. Assets & Overlays */}
                  <section className={cn("space-y-8", activeTab !== "assets" && "hidden")}>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline font-bold">Photography & Cinematic Control</h2>
                      <p className="text-muted-foreground text-sm">Manage asset scaling and cinematic dimming.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-8 p-8 bg-muted/10 rounded-[2.5rem] border-2 border-dashed">
                          {formData.imageUrl ? (
                            <div className="relative w-64 h-36 rounded-2xl overflow-hidden shadow-2xl group border bg-white">
                              <Image src={formData.imageUrl} alt="" fill className="object-cover" />
                              <button onClick={() => setFormData({...formData, imageUrl: ""})} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X className="w-8 h-8" /></button>
                            </div>
                          ) : <div className="w-64 h-36 bg-white rounded-2xl flex items-center justify-center border shadow-inner"><Plus className="w-10 h-10 opacity-10" /></div>}
                          <MediaLibraryDialog onSelect={(url) => setFormData({...formData, imageUrl: url})} trigger={<Button variant="outline" className="h-12 rounded-xl px-8 font-bold border-honey-gold text-honey-gold">Library</Button>} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="space-y-2">
                              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Image Fit</Label>
                              <Select value={formData.imageFit} onValueChange={v => setFormData({...formData, imageFit: v})}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="object-cover">Cover (Fill Screen)</SelectItem>
                                  <SelectItem value="object-contain">Contain (Show Entire Image)</SelectItem>
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Focus Point</Label>
                              <Select value={formData.imagePosition} onValueChange={v => setFormData({...formData, imagePosition: v})}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="top">Top</SelectItem>
                                  <SelectItem value="bottom">Bottom</SelectItem>
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Overlay Dimming (0-1)</Label>
                              <Input type="number" step="0.1" value={formData.opacity} onChange={e => setFormData({...formData, opacity: parseFloat(e.target.value)})} className="h-12 rounded-xl" />
                           </div>
                        </div>

                        <div className="pt-8 border-t">
                           <div className="flex items-center justify-between p-6 bg-muted/10 rounded-3xl border">
                              <Label className="font-bold text-sm">Public Visibility</Label>
                              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                <SelectTrigger className="w-32 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="active">Live</SelectItem>
                                  <SelectItem value="draft">Internal</SelectItem>
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
                 <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8 font-bold">Discard Changes</Button>
                 <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-honey-gold text-honey-dark rounded-xl h-12 px-12 font-bold shadow-xl shadow-honey-gold/20"
                 >
                   {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                   Commit Cinematic Slide
                 </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
