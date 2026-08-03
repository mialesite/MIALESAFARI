"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, Calendar, Search, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function AdminMessages() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  
  const messagesQuery = useMemoFirebase(() => 
    user ? query(collection(db, "messages"), orderBy("createdAt", "desc")) : null,
    [db, user]
  );
  
  const { data: messages, loading } = useCollection(messagesQuery);
  const { toast } = useToast();

  const filteredMessages = messages?.filter(msg => 
    msg.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
        toast({
          title: "Inquiry Deleted",
          description: "The message has been removed from the database.",
        });
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete inquiry.",
        });
      }
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
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Customer Inquiries</h1>
          <p className="text-muted-foreground">Manage and respond to messages from your customers.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[200px]">Sender</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="hidden lg:table-cell">Message Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing messages...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMessages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages?.map((msg: any) => (
                  <TableRow 
                    key={msg.id} 
                    className="group hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedMsg(msg)}
                  >
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-honey-gold/10 flex items-center justify-center text-honey-gold text-xs">
                          {msg.fullName?.charAt(0)}
                        </div>
                        <span className="truncate max-w-[150px]">{msg.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">{msg.email}</span>
                        </div>
                        {msg.phone && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{msg.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[300px]">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {msg.message}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-honey-gold"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-destructive"
                          onClick={(e) => handleDelete(e, msg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedMsg} onOpenChange={(open) => !open && setSelectedMsg(null)}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold">Inquiry Details</DialogTitle>
            <DialogDescription>
              Received on {selectedMsg?.createdAt?.toDate ? format(selectedMsg.createdAt.toDate(), 'PPP p') : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMsg && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sender Name</p>
                  <p className="font-medium text-lg">{selectedMsg.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Contact Email</p>
                  <p className="font-medium text-lg">{selectedMsg.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{selectedMsg.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Customer Message</p>
                <div className="bg-muted/30 p-6 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap border border-border/50 italic">
                  "{selectedMsg.message}"
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setSelectedMsg(null)}
                  className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold"
                >
                  Close Inquiry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}