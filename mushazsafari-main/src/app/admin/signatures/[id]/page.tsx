import { redirect } from 'next/navigation';

/**
 * Static Export Compatibility Helper
 * In 'output: export' mode, dynamic [id] paths require generateStaticParams.
 * This satisfies the build engine by providing a default static path.
 */
export async function generateStaticParams() {
  // We only pre-render 'new' as a entry point. 
  // Existing IDs are handled via client-side query params in the editor.
  return [{ id: 'new' }];
}

export default async function SignatureRedirect(props: { params: Promise<{ id: string }> }) {
  // Next.js 15: params is a promise that must be awaited
  const params = await props.params;
  const id = params.id;
  
  // Static exports generate a physical file. We redirect the request 
  // to the physical static editor page with a query parameter.
  redirect(`/admin/signatures/editor/?id=${id}`);
  
  return null;
}
