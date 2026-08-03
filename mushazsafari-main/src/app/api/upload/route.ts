import { NextResponse } from 'next/server';

/**
 * API route for file uploads. 
 * Note: This route will not be available in a pure Static Export 'out' folder,
 * but is included for development and hybrid hosting scenarios.
 */
export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    if (process.env.NEXT_PUBLIC_USE_VERCEL_BLOB === 'true') {
      try {
        // Dynamic import to prevent bundling Node logic into client traces
        const { put } = await import('@vercel/blob');
        const blob = await put(file.name, file, { access: 'public' });
        return NextResponse.json({ url: blob.url });
      } catch (e) {
        console.warn('Vercel Blob resolution error in static build context');
      }
    }

    return NextResponse.json({ 
      error: 'Direct upload requires a Node.js backend. Use Base64 or External Relay for static hosts.' 
    }, { status: 501 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
