/**
 * @fileOverview Server-side Genkit flow definition for Product Recommendations.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AiProductRecommenderInputSchema, AiProductRecommenderOutputSchema } from '../ai-product-recommender';

const productRecommenderPrompt = ai.definePrompt({
  name: 'productRecommenderPrompt',
  input: { schema: AiProductRecommenderInputSchema },
  output: { schema: AiProductRecommenderOutputSchema },
  prompt: `You are a Bespoke Wellness Consultant for Alvena Bees Investment, Tanzanian honey experts. 
  Recommend 1 to 3 products based on:
  Goals: {{{healthGoals}}}
  Dietary: {{{dietaryNeeds}}}
  Flavor: {{{flavorPreferences}}}`,
});

export const aiProductRecommenderFlow = ai.defineFlow(
  {
    name: 'aiProductRecommenderFlow',
    inputSchema: AiProductRecommenderInputSchema,
    outputSchema: AiProductRecommenderOutputSchema,
  },
  async (input) => {
    const { output } = await productRecommenderPrompt(input);
    return output!;
  }
);
