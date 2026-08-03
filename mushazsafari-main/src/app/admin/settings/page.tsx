
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Save, Mail, Shield, Server, Send, 
  FileCode, AlignLeft, Info, Lock, AlertCircle, 
  CheckCircle2, XCircle, Gauge
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SMTPDiagnosticResult } from "@/services/email/service";

const AUTHORIZED_EMAILS = [
  'admin@mialesafari.com',
  'admin@mialesafaris.com',
  'admin@mushazsafari.com',
  'admin@mushazsafaris.com'
];

export default function AdminSettings() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const configRef = useMemoFirebase(() => 
    user ? doc(db, "system", "config") : null, 
    [db, user]
  );
  
  const { data: config, loading: configLoading } = useDoc(configRef);

  const [companySignature, setCompanySignature] = useState("");
  const [smtpConfig, setSmtpConfig] = useState({
    emailHost: "",
    emailPort: "",
    emailUser: "",
    emailPass: ""
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [diagnostic, setDiagnostic] = useState<SMTPDiagnosticResult | null>(null);

  useEffect(() => {
    if (config) {
      setCompanySignature(config.companySignature || "");
      setSmtpConfig({
        emailHost: config.emailHost || "",
        emailPort: config.emailPort || "",
        emailUser: config.emailUser || "",
        emailPass: config.emailPass || ""
      });
    }
  }, [config]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configRef || !user) return;

    setSaving(true);
    const data = { ...smtpConfig, companySignature };
    
    setDoc(configRef, data, { merge: true })
      .then(() => {
        toast({ title: "Configuration Updated", description: "SMTP and Branding settings have been synchronized." });
        setSaving(false)
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: configRef.path,
          operation: "write",
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit("permission-error", permissionError);
        setSaving(false);
      });
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTesting(true);
    setDiagnostic(null);
    
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      
      const result = await response.json();
      setDiagnostic(result);
      
      if (response.ok) {
        toast({ title: "Diagnostic Successful", description: "SMTP connection verified and email dispatched." });
      } else {
        throw new Error(result.message || "Diagnostic failed");
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Diagnostic Failed", 
        description: err.message 
      });
    } finally {
      setTesting(false);
    }
  };

  if (userLoading || (user && configLoading)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-honey-gold" />
      </div>
    );
  }

  const userEmail = user?.email?.toLowerCase() || '';
  const isAuthorized = AUTHORIZED_EMAILS.includes(userEmail);

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-destructive opacity-20" />
        <p className="text-muted-foreground">Access Restricted to Authorized Personnel Only</p>
        <Button variant="outline" onClick={() => window.location.href = '/admin/login'}>Re-authenticate</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Infrastructure Settings</h1>
          <p className="text-muted-foreground">Manage centralized dispatch and brand identity protocols.</p>
        </div>
        <div className="px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-2">
           <Shield className="w-4 h-4 text-green-600" />
           <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Master Authority Active</span>
        </div>
      </div>

      <Tabs defaultValue="smtp">
        <TabsList className="bg-muted/50 p-1 mb-8">
          <TabsTrigger value="smtp" className="flex gap-2"><Server className="w-4 h-4" /> Dispatch Proxy</TabsTrigger>
          <TabsTrigger value="branding" className="flex gap-2"><FileCode className="w-4 h-4" /> Global Branding</TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2"><Shield className="w-4 h-4" /> Access Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-[#1e1e1e] text-white">
                  <CardTitle className="text-xl flex items-center gap-2 font-headline text-honey-gold">
                    <Lock className="w-5 h-5" />
                    SMTP Runtime Credentials
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Priority Management via system/config</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <Alert className="bg-honey-gold/5 border-honey-gold/20 rounded-2xl">
                     <Info className="h-4 w-4 text-honey-gold" />
                     <AlertTitle className="text-xs font-bold uppercase tracking-widest text-honey-gold">Port 465 Recommendation</AlertTitle>
                     <AlertDescription className="text-[10px] text-muted-foreground leading-relaxed">
                        Miale prioritizes <strong>Port 465 (Implicit SSL)</strong> for security. The infrastructure includes an automatic fallback to <strong>Port 587</strong> if 465 is restricted by your local firewall.
                     </AlertDescription>
                   </Alert>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">SMTP Host</Label>
                        <Input value={smtpConfig.emailHost} onChange={e => setSmtpConfig(p => ({...p, emailHost: e.target.value}))} placeholder="mialesafari.com" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Preferred Port</Label>
                        <Input value={smtpConfig.emailPort} onChange={e => setSmtpConfig(p => ({...p, emailPort: e.target.value}))} placeholder="465" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Authorized User</Label>
                        <Input value={smtpConfig.emailUser} onChange={e => setSmtpConfig(p => ({...p, emailUser: e.target.value}))} placeholder="info@mialesafari.com" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Secure Password</Label>
                        <Input type="password" value={smtpConfig.emailPass} onChange={e => setSmtpConfig(p => ({...p, emailPass: e.target.value}))} placeholder="••••••••" className="h-12 rounded-xl" />
                      </div>
                   </div>
                   <Button onClick={handleSaveConfig} disabled={saving} className="w-full bg-honey-gold text-honey-dark font-bold rounded-xl h-12 shadow-lg shadow-honey-gold/20">
                      {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Apply Infrastructure Changes
                   </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Relay Diagnostics</CardTitle>
                  <CardDescription>Verify SMTP authorization and check for port restrictions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Test Recipient</Label>
                    <Input 
                      placeholder="test@example.com" 
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 border-honey-gold text-honey-gold hover:bg-honey-gold hover:text-honey-dark font-bold rounded-xl"
                    onClick={handleTestEmail}
                    disabled={testing || !testEmail}
                  >
                    {testing ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
                    Dispatch Test
                  </Button>

                  {diagnostic && (
                    <div className={cn(
                      "p-4 rounded-xl border text-xs space-y-3",
                      diagnostic.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                      <div className="flex items-center gap-2 font-bold">
                        {diagnostic.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={diagnostic.success ? "text-green-700" : "text-red-700"}>
                          {diagnostic.message}
                        </span>
                      </div>
                      
                      {diagnostic.success && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-green-600/70 uppercase font-bold">
                          <div className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {diagnostic.responseTime}</div>
                          <div className="flex items-center gap-1"><Server className="w-3 h-3" /> Port {diagnostic.port}</div>
                        </div>
                      )}

                      {!diagnostic.success && (
                        <div className="space-y-2">
                          <p className="text-red-600 font-medium">{diagnostic.errorDetail}</p>
                          <div className="p-2 bg-white rounded-lg border border-red-100 text-[10px] text-red-800 italic">
                            <strong>Suggested:</strong> {diagnostic.suggestedFix}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="text-xl flex items-center gap-2 font-headline">
                 <AlignLeft className="w-5 h-5 text-honey-gold" />
                 Communication Footer
               </CardTitle>
               <CardDescription>Global signature applied to all system-generated dispatches.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">HTML Signature Content</Label>
                  <Textarea 
                    value={companySignature} 
                    onChange={(e) => setCompanySignature(e.target.value)}
                    placeholder="MIALE • ARUSHA, TANZANIA"
                    className="min-h-[150px] font-mono text-xs leading-relaxed rounded-xl"
                  />
                </div>
                <Button onClick={handleSaveConfig} disabled={saving} className="bg-honey-gold text-honey-dark font-bold rounded-xl h-11 px-8">
                  {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
                  Sync Branding
                </Button>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Identity & Authorization</CardTitle>
              <CardDescription>Authorized personnel with master database access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { email: "admin@mialesafari.com", role: "Master Admin", status: "Primary" },
                  { email: "admin@mialesafaris.com", role: "Super Admin", status: "Active" },
                ].map((r) => (
                  <div key={r.email} className={cn(
                    "p-6 rounded-3xl border flex items-center justify-between transition-all",
                    user?.email?.toLowerCase() === r.email.toLowerCase() ? "bg-honey-gold/10 border-honey-gold/30 shadow-lg" : "bg-muted/20 border-border"
                  )}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-honey-gold/10 flex items-center justify-center text-honey-gold">
                         <Shield className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-sm">{r.email}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{r.role}</p>
                       </div>
                    </div>
                    {user?.email?.toLowerCase() === r.email.toLowerCase() && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
                        ACTIVE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
