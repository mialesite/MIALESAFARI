import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/service';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.fullName || !data.email) {
      return NextResponse.json({ error: 'Missing core identity details.' }, { status: 400 });
    }

    const signature = await emailService.getCompanySignature();

    await emailService.sendBookingRequest(data, signature);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Booking Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
