/**
 * @fileOverview AI-Driven Safari Itinerary Generator
 * Processes user preferences to create luxury expedition states.
 */

import { z } from 'zod';

export const SafariPreferencesSchema = z.object({
  travellerType: z.enum(['solo', 'couple', 'family', 'group']).describe('Type of travelers'),
  pace: z.enum(['relaxed', 'balanced', 'intense']).describe('Desired speed of travel'),
  interests: z.array(z.string()).describe('Top interests (e.g., photography, migration, relaxation)'),
  budgetTier: z.enum(['luxury', 'elite', 'ultra-bespoke']).describe('Level of accommodation and logistics'),
  durationDays: z.number().min(3).max(21).describe('Total trip length'),
});

export type SafariPreferences = z.infer<typeof SafariPreferencesSchema>;

export const SafariItineraryOutputSchema = z.object({
  title: z.string().describe('Expedition name'),
  tagline: z.string().describe('Short editorial teaser'),
  dailySchedule: z.array(z.object({
    day: z.number(),
    destination: z.string(),
    activity: z.string(),
    accommodation: z.string(),
    highlights: z.array(z.string()),
  })),
  logisticsSummary: z.object({
    totalTravelDistance: z.string(),
    DomesticFlights: z.number(),
    bestTimeToTravel: z.string(),
  }),
});

export type SafariItineraryOutput = z.infer<typeof SafariItineraryOutputSchema>;

/**
 * Placeholder for the AI Flow.
 * In a real implementation, this would call Genkit flows.
 */
export async function generateCustomSafari(input: SafariPreferences): Promise<SafariItineraryOutput> {
  // Mock implementation for UI state mapping
  return {
    title: "The Ultimate Serengeti Odyssey",
    tagline: "A deep dive into the heart of the Great Migration.",
    dailySchedule: [
      {
        day: 1,
        destination: "Arusha",
        activity: "Arrival and luxury lodge briefing",
        accommodation: "Mushaz Private Estate",
        highlights: ["Sunset Dinner", "Personal Chef"],
      }
    ],
    logisticsSummary: {
      totalTravelDistance: "450km",
      DomesticFlights: 2,
      bestTimeToTravel: "July to October",
    }
  };
}