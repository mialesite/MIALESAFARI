import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/service';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { order } = await request.json();

    if (!order) {
      return NextResponse.json({ error: 'Order details missing.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const configDoc = await getDoc(doc(firestore, 'system', 'config'));
    const signature = configDoc.exists() ? configDoc.data()?.companySignature : null;

    await emailService.sendOrderNotification(order, signature);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order Notification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
