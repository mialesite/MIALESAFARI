/**
 * @fileOverview Server-side Genkit flow definition for Signature Content.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GenerateSignatureInputSchema, GenerateSignatureOutputSchema } from '../generate-signature-content';

const signaturePrompt = ai.definePrompt({
  name: 'signaturePrompt',
  input: { schema: GenerateSignatureInputSchema },
  output: { schema: GenerateSignatureOutputSchema },
  prompt: `You are a Senior Brand Identity Consultant for Miale Safari, a Tanzania tour operator.
  Generate premium tagline and CTA for:
  Name: {{{fullName}}}
  Title: {{{jobTitle}}}
  Goals: {{{goals}}}`,
});

export const generateSignatureContentFlow = ai.defineFlow(
  {
    name: 'generateSignatureContentFlow',
    inputSchema: GenerateSignatureInputSchema,
    outputSchema: GenerateSignatureOutputSchema,
  },
  async (input) => {
    const { output } = await signaturePrompt(input);
    return output!;
  }
);
