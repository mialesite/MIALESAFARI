import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/service';

export async function POST(request: Request) {
  let data: any;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!data.fullName || !data.email || !data.message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // The enquiry itself is stored by the browser in Firestore. This endpoint only
  // notifies the office, so a mail fault must never be reported as a lost enquiry.
  const signature = await emailService.getCompanySignature();
  const result = await emailService.trySendContactInquiry(data, signature);

  return NextResponse.json({ success: true, emailSent: result.sent });
}
