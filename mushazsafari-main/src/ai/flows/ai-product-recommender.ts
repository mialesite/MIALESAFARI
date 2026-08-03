/**
 * @fileOverview Client-side proxy for the AI Product Recommender.
 * This file is safe for the browser as it avoids importing Node-only SDKs.
 */

import { z } from 'zod';

export const AiProductRecommenderInputSchema = z.object({
  healthGoals: z.array(z.string()).describe('List of health goals.'),
  dietaryNeeds: z.array(z.string()).optional().describe('List of dietary needs.'),
  flavorPreferences: z.array(z.string()).optional().describe('List of flavor preferences.'),
});
export type AiProductRecommenderInput = z.infer<typeof AiProductRecommenderInputSchema>;

export const AiProductRecommenderOutputSchema = z.object({
  recommendations: z.array(z.object({
    productName: z.string(),
    productType: z.string(),
    reason: z.string(),
    benefits: z.array(z.string()),
  })),
});
export type AiProductRecommenderOutput = z.infer<typeof AiProductRecommenderOutputSchema>;

/**
 * Calls the AI recommender. 
 * In a static export, this calls an external API endpoint.
 */
export async function aiProductRecommender(input: AiProductRecommenderInput): Promise<AiProductRecommenderOutput> {
  try {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) throw new Error('AI Service Unavailable');
    return await response.json();
  } catch (error) {
    console.error('AI Proxy Error:', error);
    // Return a graceful fallback if the backend is not yet configured on cPanel
    return {
      recommendations: [
        {
          productName: "Singida Pure Honey",
          productType: "Pure Honey",
          reason: "Our signature selection for general wellness.",
          benefits: ["Energy boost", "Immune support"]
        }
      ]
    };
  }
}
