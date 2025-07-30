'use client';

import React from 'react';

export default function TestPage() {
  const sendEmail = async () => {
    const res = await fetch('/api/send', {
      method: 'POST',
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      alert('Email sent!');
    } else {
      alert('Failed to send email.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Test Resend Email</h1>
      <button
        onClick={sendEmail}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send Email
      </button>
    </div>
  );
}
