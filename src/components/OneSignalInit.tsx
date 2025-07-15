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
    
    // Check if OneSignal is already initialized
    if (window.OneSignal && window.OneSignal.initialized) return;
    
    const initOneSignal = () => {
      window.OneSignal = window.OneSignal || [];
      
      window.OneSignal.push(function () {
        window.OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          notifyButton: { 
            enable: true,
            size: 'medium',
            theme: 'default',
            position: 'bottom-right'
          },
          allowLocalhostAsSecureOrigin: true,
          promptOptions: {
            slidedown: {
              enabled: true,
              autoPrompt: true,
              timeDelay: 3, // Show after 3 seconds
              pageViews: 1, // Show after 1 page view
              actionMessage: "We'd like to show you notifications for the latest news and updates.",
              acceptButtonText: "Allow",
              cancelButtonText: "Cancel"
            }
          }
        });
        
        // Set external user ID if provided
        if (userId) {
          window.OneSignal.setExternalUserId(userId);
        }
        
        // Force show the prompt if not already shown
        window.OneSignal.showSlidedownPrompt();
      });
    };

    // Check if OneSignal script is already loaded
    if ("OneSignal" in window) {
      initOneSignal();
    } else {
      // Load OneSignal script
      const oneSignalScript = document.createElement("script");
      oneSignalScript.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
      oneSignalScript.async = true;
      oneSignalScript.onload = initOneSignal;
      document.head.appendChild(oneSignalScript);
    }
  }, [userId]);
  
  return null;
}