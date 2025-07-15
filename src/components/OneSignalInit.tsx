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
    
    const initOneSignal = () => {
      console.log("Initializing OneSignal...");
      
      window.OneSignal = window.OneSignal || [];
      
      window.OneSignal.push(function () {
        console.log("OneSignal push function called");
        
        window.OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          notifyButton: { 
            enable: true,
            size: 'medium',
            theme: 'default',
            position: 'bottom-right'
          },
          allowLocalhostAsSecureOrigin: true,
          autoResubscribe: true,
          autoRegister: true,
          promptOptions: {
            slidedown: {
              enabled: true,
              autoPrompt: true,
              timeDelay: 2, // Show after 2 seconds
              pageViews: 1, // Show after 1 page view
              actionMessage: "We'd like to show you notifications for the latest news and updates.",
              acceptButtonText: "Allow",
              cancelButtonText: "Cancel"
            }
          }
        }).then(() => {
          console.log("OneSignal initialized successfully");
          console.log("Permission:", window.OneSignal.getNotificationPermission());
          
          // Set external user ID if provided
          if (userId) {
            window.OneSignal.setExternalUserId(userId);
          }
          
          // Check permission and show prompt if needed
          const permission = window.OneSignal.getNotificationPermission();
          if (permission === 'default') {
            console.log("Showing slidedown prompt...");
            window.OneSignal.showSlidedownPrompt();
          }
        }).catch((error) => {
          console.error("OneSignal initialization error:", error);
        });
      });
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if ("OneSignal" in window && typeof window.OneSignal !== "undefined") {
        initOneSignal();
      } else {
        // Load OneSignal script
        const oneSignalScript = document.createElement("script");
        oneSignalScript.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
        oneSignalScript.async = true;
        oneSignalScript.onload = () => {
          console.log("OneSignal script loaded");
          initOneSignal();
        };
        oneSignalScript.onerror = (error) => {
          console.error("Failed to load OneSignal script:", error);
        };
        document.head.appendChild(oneSignalScript);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId]);
  
  return null;
}