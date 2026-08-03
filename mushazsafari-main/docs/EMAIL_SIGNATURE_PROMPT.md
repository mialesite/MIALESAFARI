# Email Signature Generator Module Prompt

Use this prompt to recreate the high-end, brand-aligned Email Signature module designed for Alvena Bees Investment.

---

**Prompt:**

Build a premium **Email Signature Generator** module for a luxury Tanzanian apiculture (beekeeping) brand. The system must generate production-ready HTML code that is highly compatible with Gmail, Outlook, and Apple Mail.

### 1. Visual Design Language
*   **Brand Inspiration**: Inherit design elements from a luxury organic honey brand. 
*   **Colors**: Use a "Honey Gold" palette (`#F4B400`, `#FFB000`) with deep dark accents (`#111111`).
*   **Motifs**: Subtle honeycomb pattern backgrounds, hexagonal borders for profile photos, and organic flowing divider lines.
*   **Typography**: Use a mix of premium serif fonts (like Playfair Display) for names and clean sans-serif (PT Sans) for contact details.

### 2. Signature Layout (Desktop vs. Mobile)
*   **Desktop Layout**: A sophisticated two-column table.
    *   **Left Column**: Full Name (Serif, Bold), Job Title (Gold, Uppercase, Tracking), Contact Details (Phone, Email, Website with themed icons), Social Media row, and a Call-to-Action (CTA) Button.
    *   **Right Column**: A vertical divider followed by the Company Logo or Staff Photo (Hexagonal) and a dynamic QR Code linking to the store.
*   **Mobile Layout**: Must use a "fluid-stack" table approach. On small screens, the Left and Right columns must stack vertically (Text info on top, Logo/QR below) to maintain readability.
*   **Vertical Alignment**: Icons and text for contact info must stay on the same line (`white-space: nowrap`) with themed icons.

### 3. Iconography Strategy
To maintain brand cohesion across all staff signatures, use **Dynamic Themed Iconography**:
*   **Source**: Utilize the Icons8 iOS-filled CDN to allow for real-time color injection.
*   **Prompt/Logic**: Icons must match the exact hex code of the brand (`#F4B400`).
*   **Icon Mapping**:
    *   *Phone*: `https://img.icons8.com/ios-filled/32/[HEX]/phone.png`
    *   *Email*: `https://img.icons8.com/ios-filled/32/[HEX]/filled-message.png`
    *   *Website*: `https://img.icons8.com/ios-filled/32/[HEX]/domain.png`
    *   *Socials*: Use official brand shapes (Facebook-new, Instagram-new, Youtube-play) color-coded to the theme.
    *   *Trust*: `https://img.icons8.com/ios-filled/32/[HEX]/guarantee.png` for certifications.
*   **Implementation**: Embed these as `<img>` tags with fixed widths (14px to 18px) and `vertical-align: middle` to ensure they sit perfectly level with the text.

### 4. Features & Builder UI
*   **Real-time Builder**: Side-by-side editor with fields for Name, Title, Contact, and Socials.
*   **Live Preview**: Toggle between Desktop, Mobile, and Webmail (Gmail/Outlook) simulation modes.
*   **AI Integration**: Integrate an AI Copywriter (via Genkit) that analyzes the user's role to generate brand-aligned taglines and "Honey Shop" CTAs.
*   **Trust Badges**: A toggleable section in the footer for "Sustainable Harvest" and "100% Organic" certifications with gold iconography.
*   **QR Code**: Dynamic generation of a QR code that points to the product catalog.

### 5. Technical Specifications
*   **Code Quality**: Generate table-based HTML (`<table>`, `<tr>`, `<td>`) with 100% inline CSS. No external stylesheets or JavaScript.
*   **Image Handling**: Serve images through a resilient storage relay. Use optimized PNGs for icons to ensure transparency works on all background colors.
*   **Export Actions**: 
    *   "Copy HTML" for code-based editors (cPanel/Webmail).
    *   "Copy Rich Signature" for visual pasting (Gmail/Outlook).
*   **Data Persistence**: Store templates and generated signatures in Firebase Firestore.

---

### Implementation Direction for AI Coding Partner:
"I want the signature to feel like an extension of a high-end luxury website. Every element, from the way the QR code is styled to the font-stack used in the disclaimer, should scream 'Gold Standard Honey'. Use color-injected CDN icons so that if I change the brand gold color, every icon in the signature updates automatically to stay perfectly on-brand."
