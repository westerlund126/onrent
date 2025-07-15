"use client";
import { useEffect } from "react";

// Extend the Window interface to include OneSignal
declare global {
  interface Window {
    OneSignal: any;
  }
}

export default function OneSignalInit({ userId }: { userId?: string }) {
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;
    
    // Check if OneSignal is already loaded
    if ("OneSignal" in window) return;
    
    const oneSignalScript = document.createElement("script");
    oneSignalScript.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
    oneSignalScript.async = true;
    document.head.appendChild(oneSignalScript);
    
    // Initialize OneSignal array if it doesn't exist
    (window as Window).OneSignal = (window as Window).OneSignal || [];
    
    (window as Window).OneSignal.push(function () {
      (window as Window).OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
      });
      
      if (userId) {
        (window as Window).OneSignal.setExternalUserId(userId);
      }
    });
  }, [userId]);
  
  return null;
}