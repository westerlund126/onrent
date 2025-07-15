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
        
        const appId = "61505641-03dc-4eb9-91a6-178833446fbd";
        console.log("Using App ID:", appId);
        
        window.OneSignal.init({
          appId: appId,
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
        });
        
        // Wait for initialization to complete
        window.OneSignal.push(function() {
          console.log("OneSignal post-init check");
          console.log("Is initialized:", window.OneSignal.initialized);
          
          // Set external user ID if provided
          if (userId) {
            console.log("Setting external user ID:", userId);
            window.OneSignal.setExternalUserId(userId);
          }
          
          // Show prompt after a short delay
          setTimeout(() => {
            console.log("Attempting to show slidedown prompt...");
            window.OneSignal.showSlidedownPrompt();
          }, 3000);
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