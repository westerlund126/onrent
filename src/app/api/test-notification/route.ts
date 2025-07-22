// File: app/api/test-notification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OneSignalService } from 'lib/onesignal'; // Adjust path if needed

/**
 * This API route sends a test notification to the currently authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get the user ID from the current session
    const { userId } = await auth();

    if (!userId) {
      // This should not happen if the page is protected, but it's a good safeguard
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[API Test] Attempting to send notification to external_id: ${userId}`);

    // 2. Create an instance of the OneSignal service
    const oneSignalService = new OneSignalService();
    
    // 3. Define the notification content
    const notification = {
      include_external_user_ids: [userId],
      headings: {
        en: 'Test Notification',
        id: 'Notifikasi Tes'
      },
      contents: {
        en: 'If you received this, your setup is working correctly!',
        id: 'Jika Anda menerima ini, pengaturan Anda sudah benar!'
      },
      // Optional: Add a link to redirect the user when they click the notification
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    };

    // 4. Send the notification using the service
    const result = await oneSignalService.sendNotification(notification);

    console.log('[API Test] OneSignal API response:', result);

    return NextResponse.json({ success: true, message: 'Test notification sent!', data: result });

  } catch (error: any) {
    console.error('[API Test] Failed to send test notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
