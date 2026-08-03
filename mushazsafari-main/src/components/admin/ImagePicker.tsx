'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Trash2, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/image-utils';
import { uploadToBlob, type UploadResult } from '@/app/actions/blob-actions';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

export function ImagePicker({ value, onChange, label, folder = "alvena/Products-Uploads" }: ImagePickerProps) {
  const [mode, setMode] = useState<'url' | 'upload'>(
    value?.startsWith('data:') ? 'upload' : 'url'
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Client-side compression
      const compressed = await compressImage(file);
      
      // 2. Transmit via FormData relay
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('folder', folder);
      
      const result: UploadResult = await uploadToBlob(formData);
      
      if (result.error) throw new Error(result.error);
      if (result.url) {
        onChange(result.url);
        toast({ 
          title: "Asset Ready", 
          description: result.warning ? "Prototype stored via Base64." : `Stored in ${folder}` 
        });
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Upload Error", 
        description: "Could not process image. Please try again." 
      });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">
          {label || "Product Image"}
        </label>
        <div className="flex p-0.5 bg-muted rounded-full border">
          <button 
            type="button" 
            onClick={() => setMode('url')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
              mode === 'url' ? "bg-white shadow-sm text-honey-gold" : "text-muted-foreground"
            )}
          >
            EXTERNAL LINK
          </button>
          <button 
            type="button" 
            onClick={() => setMode('upload')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
              mode === 'upload' ? "bg-white shadow-sm text-honey-gold" : "text-muted-foreground"
            )}
          >
            DIRECT UPLOAD
          </button>
        </div>
      </div>

      <div className="p-8 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center">
        {mode === 'url' ? (
          <div className="w-full space-y-4">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Paste high-res image URL (uploads.mushazsafari.com)..." 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-white px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-gold shadow-sm"
              />
            </div>
            {value && !value.startsWith('data:') && (
              <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                <Image src={value} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={loading} 
              className="rounded-xl h-14 border-honey-gold text-honey-gold hover:bg-honey-gold hover:text-white px-12 font-bold shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
              {value && value.startsWith('data:') ? "Replace Local File" : "Select Photography"}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {value && value.startsWith('data:') && (
              <div className="relative w-40 h-40 mt-8 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white group">
                <Image src={value} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => onChange("")} 
                    className="bg-white/90 text-destructive p-3 rounded-full shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {!value && !loading && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-50">
                  <AlertCircle className="w-3 h-3" />
                  Three-Tier Resilient Storage Protocol Active
                </div>
                <p className="text-[10px] text-muted-foreground italic">Target: {folder}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
