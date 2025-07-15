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
          autoRegister: true
        });
      });
      
      // Wait for OneSignal to be fully ready before showing prompts
      const checkInitialized = () => {
        window.OneSignal.push(function() {
          console.log("Checking if OneSignal is ready...");
          console.log("Is initialized:", window.OneSignal.initialized);
          
          if (window.OneSignal.initialized) {
            console.log("OneSignal is ready!");
            
            // Set external user ID if provided
            if (userId) {
              console.log("Setting external user ID:", userId);
              window.OneSignal.setExternalUserId(userId);
            }
            
            // Check current permission
            window.OneSignal.getNotificationPermission().then(permission => {
              console.log("Current permission:", permission);
              
              if (permission === 'default') {
                console.log("Showing slidedown prompt...");
                window.OneSignal.showSlidedownPrompt();
              } else {
                console.log("Permission already granted or denied:", permission);
              }
            });
          } else {
            console.log("OneSignal not ready yet, retrying in 1 second...");
            setTimeout(checkInitialized, 1000);
          }
        });
      };
      
      // Start checking after a short delay
      setTimeout(checkInitialized, 2000);
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