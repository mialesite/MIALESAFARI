
# Alvena Bees Static Export Compatibility Report

This document outlines the operational status of the Alvena Bees platform when deployed as a static HTML/CSS/JS package (e.g., on cPanel or Apache).

## 1. Successfully Converted (Fully Functional)
The following features are client-side and will work perfectly on any static host:

*   **Design & UI**: All Tailwind CSS styles, ShadCN components, and Framer Motion animations are preserved.
*   **Navigation**: All links and routing (Home, Shop, Beekeeping, Profile, etc.) are converted to standard HTML paths using the `trailingSlash` strategy.
*   **Responsive Layout**: Mobile-first design and navigation remains fully responsive.
*   **Firebase Authentication**: Admin login and session management work via the Firebase JavaScript SDK.
*   **Firestore Database**: Real-time product updates, order tracking, and log management remain functional as they communicate directly with the Firebase Cloud from the user's browser.
*   **Cart & Wishlist**: Local state-based shopping functionality is fully preserved.
*   **Search & Filtering**: Client-side catalog search and category filtering remain operational.
*   **Signature Builder**: The visual editor and HTML generation logic work entirely on the client.

## 2. Firebase-Dependent Features
These features work statically but require your Firebase Project to remain active:

*   **Order Storage**: New orders are saved directly to Firestore from the checkout page.
*   **Contact Messages**: Inquiries are logged directly to the database.
*   **Inventory Logs**: Stock movements are tracked in real-time.
*   **Newsletter**: Email subscriptions are captured in the Firestore collection.

## 3. Features Requiring a Backend (Server-Side)
The following features depend on Node.js/Server logic. If hosted on a static-only cPanel (no Node.js), these will require a separate relay or Cloud Function:

*   **AI Wellness Consultant**: The Genkit-powered product recommendations require a server to securely call the LLM. 
    *   *Solution*: These must be called as an external Firebase Function or a separate API if the host is strictly HTML-only.
*   **Automated Email Notifications**: The NodeMailer engine requires a Node.js runtime to process SMTP transactions.
    *   *Solution*: These can be triggered via Firebase Cloud Functions or integrated with a client-side service like EmailJS.
*   **Image Processing**: Server-side image compression in the admin panel will fall back to the Base64 tier or require a Cloud Function.

## 4. Deployment Instructions
1.  Run `npm run export` (alias for `next build`) in your development environment.
2.  Next.js will generate a folder named `out/` in your root directory.
3.  Upload the **contents** of the `out/` folder to your cPanel `public_html` directory via File Manager or FTP.
4.  Ensure your `.htaccess` file (if on Apache) handles clean URLs or rely on the `trailingSlash: true` directories generated.
