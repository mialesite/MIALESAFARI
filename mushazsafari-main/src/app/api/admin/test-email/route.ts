
import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Recipient email missing.' }, { status: 400 });
    }

    // Run the robust diagnostic with auto-fallback
    const diagnostic = await emailService.verifyConnection();
    
    if (!diagnostic.success) {
      return NextResponse.json(diagnostic, { status: 503 });
    }

    // If verified, send the actual test email
    try {
      await emailService.sendDiagnostic(email);
      return NextResponse.json({ 
        ...diagnostic,
        message: `${diagnostic.message} Test email dispatched to ${email}.`
      });
    } catch (sendError: any) {
      return NextResponse.json({
        ...diagnostic,
        success: false,
        message: "Connection verified, but dispatch failed.",
        errorDetail: sendError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Test Email API Error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Internal Server Error",
      errorDetail: error.message 
    }, { status: 500 });
  }
}
