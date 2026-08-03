import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { name, email, location, selections, recommendations } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing lead details.' }, { status: 400 });
    }

    // 1. Fetch SMTP Config & Signature from Firestore
    const { firestore } = initializeFirebase();
    const configDoc = await getDoc(doc(firestore, 'system', 'config'));
    const config = configDoc.exists() ? configDoc.data() : null;

    const smtpHost = config?.emailHost || process.env.EMAIL_HOST || "mushazsafari.com";
    const smtpPort = parseInt(config?.emailPort || process.env.EMAIL_PORT || "465");
    const smtpUser = config?.emailUser || process.env.EMAIL_USER;
    const smtpPass = config?.emailPass || process.env.EMAIL_PASS;
    const signature = config?.companySignature || 'Alvena Bees Investment Lead System';

    if (!smtpUser || !smtpPass) {
      console.warn('SMTP Credentials missing. Skipping email notification.');
      return NextResponse.json({ success: true, warning: 'Email configuration incomplete.' });
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const timestamp = new Date().toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam' });

    const recsHtml = recommendations.map((r: any) => `
      <div style="margin-bottom: 20px; border-left: 4px solid #F4B400; padding: 15px; background: #fafafa; border-radius: 0 10px 10px 0;">
        <div style="font-weight: 900; color: #111; font-size: 16px;">${r.productName}</div>
        <div style="font-size: 12px; color: #F4B400; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">${r.productType}</div>
        <div style="font-style: italic; color: #555; font-size: 14px;">"${r.reason}"</div>
      </div>
    `).join('');

    const selectionsHtml = `
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        <strong>Health Goals:</strong> ${selections.healthGoals.join(', ')}<br>
        <strong>Flavor Prefs:</strong> ${selections.flavorPreferences?.join(', ') || 'None'}<br>
        <strong>Dietary Needs:</strong> ${selections.dietaryNeeds?.join(', ') || 'None'}
      </p>
    `;

    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
          .header { background: #111; color: #F4B400; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .label { color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
          .value { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 11px; color: #bbb; border-top: 1px solid #eee; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; letter-spacing: 3px;">NEW WELLNESS LEAD</h2>
          </div>
          <div class="content">
            <div class="label">Customer Name</div>
            <div class="value">${name}</div>
            
            <div class="label">Contact Info</div>
            <div class="value">${email}</div>
            
            <div class="label">Location</div>
            <div class="value">${location}</div>

            <div style="margin-top: 40px; border-top: 2px solid #F4B400; padding-top: 20px;">
              <h3 style="margin-bottom: 20px;">Customer Profile & AI Results</h3>
              ${selectionsHtml}
              <div style="margin-top: 30px;">
                <div class="label" style="margin-bottom: 15px;">AI Recommendations Sent</div>
                ${recsHtml}
              </div>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">Submitted on: ${timestamp}</p>
          </div>
          <div class="footer">
            ${signature}
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Email to Admin
    await transporter.sendMail({
      from: `"Alvena Wellness Consultant" <${smtpUser}>`,
      to: 'info@mushazsafari.com',
      subject: `Wellness Lead: ${name} from ${location}`,
      html: adminHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Consultation Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
