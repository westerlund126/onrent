// File: app/test-notification/page.tsx

import { SignedIn, SignedOut } from "@clerk/nextjs";
import TestNotificationButton from "components/TestNotificationButton";
import Link from "next/link";

export default function TestNotificationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <main>
        <SignedIn>
          {/* This content is only visible to signed-in users */}
          <TestNotificationButton />
        </SignedIn>
        <SignedOut>
          {/* This content is only visible to signed-out users */}
          <div className="text-center p-6 border rounded-lg shadow-md bg-white">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="mb-6">You need to be signed in to test push notifications.</p>
            <Link href="/sign-in" className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Go to Sign In
            </Link>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
