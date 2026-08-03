/**
 * @fileOverview SMTP Configuration Loader
 * Validates and exports email settings from environment variables.
 */

import { z } from 'zod';

const EmailConfigSchema = z.object({
  host: z.string().min(1, "SMTP_HOST is required"),
  port: z.coerce.number().default(465),
  secure: z.coerce.boolean().default(true),
  user: z.string().min(1, "SMTP_USER is required"),
  pass: z.string().min(1, "SMTP_PASS is required"),
  fromName: z.string().default("Miale"),
  fromAddress: z.string().email("EMAIL_FROM_ADDRESS must be a valid email"),
  adminNotifyEmail: z.string().email().default("info@mialesafari.com"),
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;

export function getEmailConfig(): EmailConfig {
  try {
    return EmailConfigSchema.parse({
      host: process.env.SMTP_HOST || "mialesafari.com",
      port: process.env.SMTP_PORT || "465",
      secure: process.env.SMTP_SECURE || "true",
      user: process.env.SMTP_USER || "info@mialesafari.com",
      pass: process.env.SMTP_PASS,
      fromName: process.env.EMAIL_FROM_NAME || "Miale",
      fromAddress: process.env.EMAIL_FROM_ADDRESS || "info@mialesafari.com",
      adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL || "info@mialesafari.com",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map(i => i.path.join('.')).join(', ');
      console.error(`❌ Email Config Error: Missing or invalid variables: ${missing}`);
    }
    throw error;
  }
}
