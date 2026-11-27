"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Save, ArrowLeft, Monitor, Smartphone, Mail, Copy, 
  Layout, User, Share2, AlertCircle, QrCode, Sparkles, ShieldCheck 
} from "lucide-react";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { generateSignatureContent } from "@/ai/flows/generate-signature-content";
import { ScrollArea } from "@/components/ui/scroll-area";

const TEMPLATES = [
  { id: "hive", name: "The Hive (Modern)", desc: "Two-column logic with honeycomb accents and right-aligned Logo/QR." },
  { id: "luxury", name: "Golden Nectar (Luxury)", desc: "Premium centered serif typography and gold highlights." },
  { id: "corporate", name: "Executive Suite", desc: "Traditional layout with clean lines and high-contrast header." }
];

function EditorContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [view, setView] = useState<"desktop" | "mobile" | "client">("desktop");
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const docRef = useMemoFirebase(() => {
    if (!id || id === "new") return doc(collection(db, "email_signatures"));
    return doc(db, "email_signatures", id);
  }, [db, id]);

  const { data: signature, loading } = useDoc(!id || id === "new" ? null : docRef);

  const [formData, setFormData] = useState({
    fullName: "MIALE",
    jobTitle: "",
    companyName: "Miale",
    email: "info@mialesafari.com",
    phone: "+255 769 333 331",
    mobile: "",
    websiteUrl: "mialesafari.com",
    address: "Arusha, Tanzania",
    logoUrl: "https://uploads.mushazsafari.com/Miale.png",
    profileUrl: "",
    templateId: "hive",
    themeColor: "#B68D40",
    disclaimer: "This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.",
    ctaText: "Plan Your Safari",
    ctaUrl: "https://mialesafari.com",
    tagline: "",
    showTrustBadges: true,
    socials: {
      facebook: "#",
      instagram: "#",
      youtube: "#",
      linkedin: "",
      x: ""
    }
  });

  useEffect(() => {
    if (signature) {
      setFormData(prev => ({
        ...prev,
        ...signature,
        socials: { ...prev.socials, ...signature.socials }
      }));
    }
  }, [signature]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: signature?.createdAt || serverTimestamp(),
      }, { merge: true }).catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: signature ? "update" : "create",
          requestResourceData: formData,
        });
        errorEmitter.emit("permission-error", permissionError);
        throw error;
      });

      toast({ title: "Signature Saved", description: "Design has been synchronized to cloud." });
      if (!id || id === "new") {
        router.push(`/admin/signatures/editor?id=${docRef.id}`);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleAiEnhance = async () => {
    setAiLoading(true);
    try {
      const res = await generateSignatureContent({
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        goals: "Refined luxury safari brand, high-end travel and wilderness focus."
      });
      
      setFormData(p => ({
        ...p,
        tagline: res.tagline,
        ctaText: res.ctaText,
        disclaimer: res.disclaimer
      }));
      
      toast({
        title: "Content Enhanced!",
        description: "AI has curated your tagline and CTA based on Miale brand standards.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate content suggestions." });
    } finally {
      setAiLoading(false);
    }
  };

  const generateHTML = () => {
    const { 
      fullName, jobTitle, companyName, email, phone, websiteUrl, 
      address, logoUrl, profileUrl, templateId, themeColor, 
      socials, disclaimer, ctaText, ctaUrl, tagline, showTrustBadges 
    } = formData;
    
    const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    const serifStack = "'Cormorant Garamond', 'Times New Roman', Times, serif";
    const hex = themeColor.replace('#', '');
    
    const iPhone = `https://img.icons8.com/ios-filled/32/${hex}/phone.png`;
    const iMail = `https://img.icons8.com/ios-filled/32/${hex}/filled-message.png`;
    const iWeb = `https://img.icons8.com/ios-filled/32/${hex}/domain.png`;
    const iFB = `https://img.icons8.com/ios-filled/32/${hex}/facebook-new.png`;
    const iIG = `https://img.icons8.com/ios-filled/32/${hex}/instagram-new.png`;
    const iYT = `https://img.icons8.com/ios-filled/32/${hex}/youtube-play.png`;
    const iTrust = `https://img.icons8.com/ios-filled/32/${hex}/guarantee.png`;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(ctaUrl)}&color=${hex}`;

    const socialRow = `
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
        <tr>
          ${socials.facebook ? `<td style="padding-right: 12px;"><a href="${socials.facebook}" style="text-decoration: none;"><img src="${iFB}" width="18" height="18" style="display: block; border: 0;" alt="FB"></a></td>` : ''}
          ${socials.instagram ? `<td style="padding-right: 12px;"><a href="${socials.instagram}" style="text-decoration: none;"><img src="${iIG}" width="18" height="18" style="display: block; border: 0;" alt="IG"></a></td>` : ''}
          ${socials.youtube ? `<td style="padding-right: 12px;"><a href="${socials.youtube}" style="text-decoration: none;"><img src="${iYT}" width="18" height="18" style="display: block; border: 0;" alt="YT"></a></td>` : ''}
        </tr>
      </table>
    `;

    if (templateId === "hive") {
      return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${fontStack}; background-color: #ffffff; max-width: 550px;">
          <tr>
            <td style="padding-bottom: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td valign="top" style="padding-right: 20px;">
                    <div style="font-family: ${serifStack}; font-size: 22px; font-weight: 800; text-transform: uppercase; color: #111111; margin-bottom: 2px;">${fullName}</div>
                    <div style="color: ${themeColor}; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; margin-bottom: 12px;">${jobTitle}</div>
                    
                    <div style="font-size: 11px; color: #777; italic; margin-bottom: 15px;">"${tagline}"</div>

                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #444444;">
                      <tr>
                        <td style="padding-bottom: 8px; white-space: nowrap;">
                          <img src="${iPhone}" width="14" height="14" style="margin-right: 10px; vertical-align: middle;">
                          <span style="vertical-align: middle;">${phone}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; white-space: nowrap;">
                          <img src="${iMail}" width="14" height="14" style="margin-right: 10px; vertical-align: middle;">
                          <a href="mailto:${email}" style="color: #444444; text-decoration: none; vertical-align: middle;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; white-space: nowrap;">
                          <img src="${iWeb}" width="14" height="14" style="margin-right: 10px; vertical-align: middle;">
                          <a href="https://${websiteUrl}" style="color: ${themeColor}; text-decoration: none; vertical-align: middle; font-weight: bold;">${websiteUrl}</a>
                        </td>
                      </tr>
                    </table>

                    ${socialRow}

                    <div style="margin-top: 20px;">
                      <a href="${ctaUrl}" style="background-color: ${themeColor}; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase; display: inline-block;">
                        ${ctaText}
                      </a>
                    </div>
                  </td>
                  <td valign="top" width="120" style="text-align: right; border-left: 1px solid #f0f0f0; padding-left: 20px;">
                    ${profileUrl ? `<img src="${profileUrl}" width="100" height="100" style="border-radius: 50%; object-fit: cover; display: block; border: 2px solid ${themeColor}; margin-bottom: 15px;" alt="P">` : `<img src="${logoUrl}" width="90" style="display: block; margin-bottom: 15px;" alt="L">`}
                    <img src="${qrCodeUrl}" width="60" height="60" style="display: block; margin: 0 0 5px auto;" alt="QR">
                    <div style="font-size: 8px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Scan Store</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${showTrustBadges ? `
          <tr>
            <td style="padding: 15px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 15px;"><img src="${iTrust}" width="14" height="14" style="vertical-align: middle; margin-right: 5px;"><span style="font-size: 10px; color: #666; vertical-align: middle; text-transform: uppercase; font-weight: 600;">Sustainable Travel</span></td>
                  <td><img src="${iTrust}" width="14" height="14" style="vertical-align: middle; margin-right: 5px;"><span style="font-size: 10px; color: #666; vertical-align: middle; text-transform: uppercase; font-weight: 600;">Elite Guiding</span></td>
                </tr>
              </table>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding-top: 15px;">
              <div style="font-size: 10px; color: #aaaaaa; line-height: 1.6; font-style: italic;">${disclaimer}</div>
            </td>
          </tr>
        </table>
      `;
    }

    if (templateId === "luxury") {
      return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${serifStack}; color: #111; line-height: 1.6; width: 100%; max-width: 480px; text-align: center;">
          <tr><td style="padding-bottom: 25px;"><img src="${logoUrl}" width="110" alt="Miale"></td></tr>
          <tr>
            <td style="border-top: 1px solid #e0e0e0; padding-top: 25px;">
              <div style="font-size: 22px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">${fullName}</div>
              <div style="color: ${themeColor}; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; font-weight: 700; font-family: ${fontStack};">${jobTitle}</div>
              <div style="font-family: ${fontStack}; font-size: 11px; color: #777; margin-bottom: 20px;">${tagline}</div>
              <div style="font-family: ${fontStack}; font-size: 11px; color: #666; text-transform: uppercase; line-height: 1.8;">
                ${address} <br>
                <span style="color: ${themeColor};">T:</span> ${phone} &nbsp; | &nbsp; <span style="color: ${themeColor};">E:</span> <a href="mailto:${email}" style="color: #111; text-decoration: none;">${email}</a>
              </div>
              <div style="margin-top: 20px;">
                <table align="center" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${socials.facebook ? `<td style="padding: 0 10px;"><a href="${socials.facebook}"><img src="${iFB}" width="16" alt="FB" border="0"></a></td>` : ''}
                    ${socials.instagram ? `<td style="padding: 0 10px;"><a href="${socials.instagram}"><img src="${iIG}" width="16" alt="IG" border="0"></a></td>` : ''}
                    ${socials.youtube ? `<td style="padding: 0 10px;"><a href="${socials.youtube}"><img src="${iYT}" width="16" alt="YT" border="0"></a></td>` : ''}
                  </tr>
                </table>
              </div>
              ${ctaText ? `<div style="margin-top: 25px;"><a href="${ctaUrl}" style="border: 1px solid ${themeColor}; color: #111; padding: 10px 25px; text-decoration: none; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-family: ${fontStack}; display: inline-block;">${ctaText}</a></div>` : ''}
            </td>
          </tr>
        </table>
      `;
    }

    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontStack}; color: #111; font-size: 14px; width: 100%; max-width: 500px;">
        <tr>
          <td valign="top" style="padding-right: 20px;">
            <strong style="text-transform: uppercase; font-size: 16px;">${fullName}</strong><br>
            <span style="color: ${themeColor}; font-weight: bold; font-size: 11px; text-transform: uppercase;">${jobTitle}</span><br>
            <div style="margin-top: 10px; color: #666; font-size: 12px;">${phone} | <a href="mailto:${email}" style="color: #666; text-decoration: none;">${email}</a></div>
            ${socialRow}
          </td>
          <td valign="top" width="80" style="text-align: right;"><img src="${logoUrl}" width="80" alt="L"></td>
        </tr>
      </table>
    `;
  };

  const copyHTML = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    toast({ title: "HTML Copied", description: "You can now paste this into your email client's source editor." });
  };

  if (loading || !isMounted) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-honey-gold w-12 h-12" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/signatures")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-headline">{!id || id === "new" ? "Create Brand Identity" : `Identity: ${formData.fullName}`}</h1>
            <p className="text-xs text-muted-foreground">Premium HTML signatures inspired by Miale website.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" onClick={copyHTML} className="rounded-xl font-bold border-honey-gold text-honey-gold flex-1 md:flex-none">
             <Copy className="w-4 h-4 mr-2" /> Copy HTML
           </Button>
           <Button onClick={handleSave} disabled={saving} className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold px-8 flex-1 md:flex-none">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
             Commit Design
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="info">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 mb-6 rounded-xl">
              <TabsTrigger value="info" className="rounded-lg text-[10px]"><User className="w-3 h-3 mr-1" /> Profile</TabsTrigger>
              <TabsTrigger value="design" className="rounded-lg text-[10px]"><Layout className="w-3 h-3 mr-1" /> Style</TabsTrigger>
              <TabsTrigger value="content" className="rounded-lg text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> AI Edit</TabsTrigger>
              <TabsTrigger value="promo" className="rounded-lg text-[10px]"><QrCode className="w-3 h-3 mr-1" /> Assets</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-6 pb-8 pr-4">
                <TabsContent value="info" className="space-y-6 mt-0">
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</Label>
                        <Input value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Job Title</Label>
                        <Input value={formData.jobTitle} onChange={e => setFormData(p => ({...p, jobTitle: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Direct Email</Label>
                        <Input value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                      </div>
                    </CardContent>
                  </Card>
                  <ImagePicker 
                    label="Staff Photography" 
                    value={formData.profileUrl} 
                    onChange={url => setFormData(p => ({...p, profileUrl: url}))} 
                    folder="signatures/profiles"
                  />
                </TabsContent>

                <TabsContent value="design" className="space-y-6 mt-0">
                  <Card className="border-none shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Signature Archetype</Label>
                          <div className="grid grid-cols-1 gap-3">
                              {TEMPLATES.map(t => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setFormData(p => ({...p, templateId: t.id}))}
                                  className={cn(
                                    "text-left p-4 rounded-xl border-2 transition-all",
                                    formData.templateId === t.id ? "border-honey-gold bg-honey-gold/5" : "border-transparent bg-muted/30 hover:border-muted"
                                  )}
                                >
                                  <p className="font-bold text-sm">{t.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                                </button>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground">Social Connectivity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="Facebook URL" value={formData.socials.facebook} onChange={e => setFormData(p => ({...p, socials: {...p.socials, facebook: e.target.value}}))} className="text-xs" />
                        <Input placeholder="Instagram URL" value={formData.socials.instagram} onChange={e => setFormData(p => ({...p, socials: {...p.socials, instagram: e.target.value}}))} className="text-xs" />
                        <Input placeholder="YouTube URL" value={formData.socials.youtube} onChange={e => setFormData(p => ({...p, socials: {...p.socials, youtube: e.target.value}}))} className="text-xs" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-0">
                  <Card className="border-none shadow-sm bg-honey-gold/5 border-honey-gold/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-honey-gold" />
                        AI Copywriter
                      </CardTitle>
                      <CardDescription className="text-xs">Let Miale AI craft your tagline and CTA based on your title.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleAiEnhance} 
                        disabled={aiLoading} 
                        className="w-full bg-honey-gold text-honey-dark font-bold rounded-xl"
                      >
                        {aiLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Suggestions
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Personal Tagline</Label>
                        <Input value={formData.tagline} onChange={e => setFormData(p => ({...p, tagline: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Shop Button Text</Label>
                        <Input value={formData.ctaText} onChange={e => setFormData(p => ({...p, ctaText: e.target.value}))} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="promo" className="space-y-6 mt-0">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm">Trust & Certifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Elite Badges</Label>
                        <input type="checkbox" checked={formData.showTrustBadges} onChange={e => setFormData(p => ({...p, showTrustBadges: e.target.checked}))} className="accent-honey-gold h-4 w-4" />
                      </div>
                      <div className="p-4 bg-muted rounded-xl flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-honey-gold" />
                        <p className="text-[10px] text-muted-foreground">Includes 'Sustainable Travel' and 'Elite Guiding' iconography in the signature layout.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Store QR Link</Label>
                        <Input value={formData.ctaUrl} onChange={e => setFormData(p => ({...p, ctaUrl: e.target.value}))} />
                        <p className="text-[10px] text-muted-foreground">Default: mialesafari.com</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border shadow-sm">
               <div className="flex p-1 bg-muted rounded-xl">
                  <button type="button" onClick={() => setView("desktop")} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", view === "desktop" ? "bg-white shadow-sm" : "text-muted-foreground")}><Monitor className="w-3 h-3 mr-2 inline" /> Desktop</button>
                  <button type="button" onClick={() => setView("mobile")} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", view === "mobile" ? "bg-white shadow-sm" : "text-muted-foreground")}><Smartphone className="w-3 h-3 mr-2 inline" /> Mobile</button>
                  <button type="button" onClick={() => setView("client")} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", view === "client" ? "bg-white shadow-sm" : "text-muted-foreground")}><Mail className="w-3 h-3 mr-2 inline" /> Gmail Preview</button>
               </div>
               <div className="flex gap-2 pr-2">
                  <div className="w-2  h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
               </div>
            </div>

            <div className={cn(
              "overflow-hidden transition-all duration-500 mx-auto w-full",
              view === "mobile" ? "max-w-[400px]" : "max-w-full"
            )}>
              <div className={cn(
                "bg-white rounded-2xl shadow-xl border border-border/50 transition-all",
                view === "mobile" ? "p-4" : "p-8 md:p-10"
              )}>
                <div 
                  className="max-w-full overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: generateHTML() }} 
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
               <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
               <div>
                  <p className="text-sm font-bold text-blue-500">Installation Guideline</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This design uses standards-compliant table structures to ensure your identity stays perfectly aligned in Outlook and Gmail. Use <strong>Copy HTML</strong> for a precise export.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignatureEditor() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-honey-gold w-12 h-12" /></div>}>
      <EditorContent />
    </Suspense>
  );
}
