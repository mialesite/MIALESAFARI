"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Search, Loader2, BadgeCheck, User, Globe, Copy } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SignaturesDashboard() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const signaturesQuery = useMemoFirebase(() => 
    user ? query(collection(db, "email_signatures"), orderBy("createdAt", "desc")) : null,
    [db, user]
  );
  
  const { data: signatures, loading } = useCollection(signaturesQuery);

  const filteredSignatures = signatures?.filter(s => 
    s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this signature?")) return;
    try {
      await deleteDoc(doc(db, "email_signatures", id));
      toast({ title: "Signature Deleted" });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Email Signature Suite</h1>
          <p className="text-muted-foreground">Build and manage professional HTML signatures for Alvena staff.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search staff..." 
              className="pl-10 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold">
            <Link href="/admin/signatures/editor?id=new">
              <Plus className="w-4 h-4 mr-2" /> Create Signature
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-honey-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-honey-gold">Active Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{signatures?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Standardized Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">HTML5</Badge>
              <Badge variant="outline" className="text-[10px]">CSS Inline</Badge>
              <Badge variant="outline" className="text-[10px]">Resilient Images</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></TableCell></TableRow>
            ) : filteredSignatures?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <BadgeCheck className="w-10 h-10 opacity-10" />
                    <p>No signatures generated yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSignatures?.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-honey-gold/10 flex items-center justify-center overflow-hidden">
                        {s.profileUrl ? <img src={s.profileUrl} className="object-cover w-full h-full" alt="" /> : <User className="w-4 h-4 text-honey-gold" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none mb-1">{s.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{s.jobTitle}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{s.templateId || "Corporate"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-[10px] space-y-0.5">
                      <p className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> {s.email}</p>
                      <p className="text-muted-foreground">{s.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/signatures/editor?id=${s.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
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
    </div>
  );
}