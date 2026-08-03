
'use client';

import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Loader2, Upload, Search, Trash2, CheckCircle2, FileStack, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { uploadToBlob } from '@/app/actions/blob-actions';

interface MediaLibraryDialogProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}

export function MediaLibraryDialog({ onSelect, trigger }: MediaLibraryDialogProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const { data: assets, loading } = useCollection(
    query(collection(db, "media"), orderBy("createdAt", "desc"))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'cms/library');

      const result = await uploadToBlob(formData);
      if (result.error) throw new Error(result.error);
      if (!result.url) throw new Error("Upload failed");

      await addDoc(collection(db, "media"), {
        name: file.name,
        url: result.url,
        size: file.size,
        mimeType: file.type,
        folder: 'cms/library',
        createdAt: serverTimestamp(),
      });

      toast({ title: "Asset Uploaded", description: "Successfully added to the library." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This may break existing references on the website.")) return;
    try {
      await deleteDoc(doc(db, "media", id));
      toast({ title: "Asset Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete asset." });
    }
  };

  const filteredAssets = assets?.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileStack className="w-4 h-4" /> Media Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-none shadow-2xl rounded-3xl bg-white">
        <DialogHeader className="p-6 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-headline font-bold">Media Library</DialogTitle>
            <div className="flex items-center gap-2">
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search assets..." 
                   className="pl-9 h-9 rounded-xl text-xs" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
               </div>
               <Button variant="outline" size="sm" className="h-9 relative rounded-xl font-bold overflow-hidden">
                 {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                 {uploading ? "Uploading..." : "Upload New"}
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
               </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-honey-gold" />
            </div>
          ) : filteredAssets?.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              <FileStack className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>No media assets found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets?.map((asset: any) => (
                <div 
                  key={asset.id} 
                  onClick={() => setSelectedUrl(asset.url)}
                  className={cn(
                    "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all",
                    selectedUrl === asset.url ? "border-honey-gold scale-95" : "border-transparent hover:border-muted"
                  )}
                >
                  <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                     <p className="text-[10px] text-white font-bold truncate mb-2">{asset.name}</p>
                     <Button 
                       size="icon" 
                       variant="destructive" 
                       className="h-7 w-7 rounded-lg self-end"
                       onClick={(e) => handleDelete(e, asset.id)}
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </Button>
                  </div>
                  {selectedUrl === asset.url && (
                    <div className="absolute inset-0 bg-honey-gold/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-honey-gold drop-shadow-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t shrink-0">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            disabled={!selectedUrl} 
            className="bg-honey-gold text-honey-dark font-bold rounded-xl px-12"
            onClick={() => {
              if (selectedUrl) {
                onSelect(selectedUrl);
                setOpen(false);
              }
            }}
          >
            Choose Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
