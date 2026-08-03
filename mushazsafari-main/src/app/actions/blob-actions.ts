/**
 * Utility for processing file uploads through resilient tiers.
 * Optimized for Static Export compatibility using dynamic imports.
 */

export type UploadResult = {
  url?: string;
  warning?: string;
  error?: string;
};

export async function uploadToBlob(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    if (!file) throw new Error('No file found in payload');

    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    // Tier 1: External API Relay
    if (process.env.UPLOAD_API_URL) {
      const response = await fetch(process.env.UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        return { url: result.url || result.data?.url };
      }
    }

    // Tier 2: Vercel Blob (Only attempts in Node environments)
    if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_USE_VERCEL_BLOB === 'true') {
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(fileName, file, { access: 'public' });
        return { url: blob.url };
      } catch (e) {
        console.warn('Vercel Blob failed, falling back to Base64');
      }
    }

    // Tier 3: Base64 Fallback (Browser-safe for static export)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          warning: 'Base64 fallback active'
        });
      };
      reader.readAsDataURL(file);
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return { error: error.message };
  }
}
