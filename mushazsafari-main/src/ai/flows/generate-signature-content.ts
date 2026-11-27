/**
 * @fileOverview Client-side proxy for the Signature Content Generator.
 * This file is safe for the browser as it avoids importing Node-only SDKs.
 */

import { z } from 'zod';

export const GenerateSignatureInputSchema = z.object({
  fullName: z.string(),
  jobTitle: z.string(),
  goals: z.string().optional(),
});
export type GenerateSignatureInput = z.infer<typeof GenerateSignatureInputSchema>;

export const GenerateSignatureOutputSchema = z.object({
  tagline: z.string(),
  ctaText: z.string(),
  disclaimer: z.string(),
  brandInsight: z.string(),
});
export type GenerateSignatureOutput = z.infer<typeof GenerateSignatureOutputSchema>;

/**
 * Calls the AI signature generator.
 */
export async function generateSignatureContent(input: GenerateSignatureInput): Promise<GenerateSignatureOutput> {
  try {
    const response = await fetch('/api/ai/generate-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) throw new Error('AI Service Unavailable');
    return await response.json();
  } catch (error) {
    console.error('AI Proxy Error:', error);
    throw new Error('AI Service Unavailable');
  }
}
