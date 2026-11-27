import { config } from 'dotenv';
config();

/**
 * Dev entry point for Genkit UI.
 * Imports flows from the server-only definitions to avoid browser bundling issues.
 */
import '@/ai/flows/server/signature';
