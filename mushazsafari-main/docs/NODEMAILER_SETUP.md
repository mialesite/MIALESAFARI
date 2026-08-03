# NodeMailer SMTP Configuration Guide

Use this documentation to set up or recreate the email notification engine used in the Alvena Bees Investment platform.

## 1. Required Environment Variables (.env)
For local development or as fallbacks if Firestore config is missing:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=465
EMAIL_USER=info@yourdomain.com
EMAIL_PASS=your-secure-password
```

## 2. Firestore Dynamic Configuration
The application primarily reads SMTP settings from a specific Firestore document to allow administrators to update credentials without redeploying code.

*   **Collection**: `system`
*   **Document ID**: `config`
*   **Fields**:
    *   `emailHost` (string): The SMTP server address.
    *   `emailPort` (string): Usually `465` for SSL or `587` for TLS.
    *   `emailUser` (string): The SMTP username/email.
    *   `emailPass` (string): The SMTP password or App Password.
    *   `companySignature` (string): HTML-ready signature for automated footers.

## 3. Implementation Logic (Next.js API Route)
Below is the standard implementation pattern used in `src/app/api/*/route.ts`:

```typescript
import nodemailer from 'nodemailer';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 1. Fetch Config
const { firestore } = initializeFirebase();
const configDoc = await getDoc(doc(firestore, 'system', 'config'));
const config = configDoc.exists() ? configDoc.data() : null;

// 2. Resolve Credentials
const smtpHost = config?.emailHost || process.env.EMAIL_HOST;
const smtpPort = parseInt(config?.emailPort || process.env.EMAIL_PORT || "465");
const smtpUser = config?.emailUser || process.env.EMAIL_USER;
const smtpPass = config?.emailPass || process.env.EMAIL_PASS;

// 3. Create Transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true, // Use true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// 4. Send Mail
await transporter.sendMail({
  from: `"Alvena System" <${smtpUser}>`,
  to: 'recipient@domain.com',
  subject: 'Subject Line',
  html: '<h1>Email Content</h1>',
});
```

## 4. Security Notes
*   **Port 465**: Always use `secure: true`.
*   **Port 587**: Use `secure: false` (it will use STARTTLS).
*   **App Passwords**: If using Gmail or Outlook, ensure you generate an "App Password" rather than using your main account password.
*   **Validation**: The Admin dashboard at `/admin/settings` provides a diagnostic tool to test these settings in real-time.
