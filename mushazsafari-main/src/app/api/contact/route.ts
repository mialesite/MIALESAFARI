import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/service';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.fullName || !data.email || !data.message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const configDoc = await getDoc(doc(firestore, 'system', 'config'));
    const signature = configDoc.exists() ? configDoc.data()?.companySignature : null;

    await emailService.sendContactInquiry(data, signature);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Nodemailer Contact Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
