// File: components/TestNotificationButton.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function TestNotificationButton() {
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSendNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult('Success! Notification sent. Check your device.');
      console.log('API Response:', data);

    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      console.error('Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return <p className="text-center text-red-500">You must be signed in to send a test notification.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold">OneSignal Test</h2>
      <button
        onClick={handleSendNotification}
        disabled={isLoading}
        className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Sending...' : 'Send Test Notification to Myself'}
      </button>
      {result && (
        <p className={`mt-4 text-sm ${result.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {result}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Note: Make sure you have allowed notifications for this site in your browser.
      </p>
    </div>
  );
}
