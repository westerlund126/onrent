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
          allowLocalhostAsSecureOrigin: true,
          autoResubscribe: true,
          autoRegister: true
        });
      });
      
      // Try to show prompt without waiting for full initialization
      setTimeout(() => {
        window.OneSignal.push(function() {
          console.log("Attempting to show prompt regardless of initialization status...");
          
          // Set external user ID if provided
          if (userId) {
            console.log("Setting external user ID:", userId);
            window.OneSignal.setExternalUserId(userId);
          }
          
          // Try multiple methods to show the prompt
          try {
            console.log("Trying showSlidedownPrompt...");
            window.OneSignal.showSlidedownPrompt();
          } catch (error) {
            console.error("showSlidedownPrompt failed:", error);
          }
          
          try {
            console.log("Trying showNativePrompt...");
            window.OneSignal.showNativePrompt();
          } catch (error) {
            console.error("showNativePrompt failed:", error);
          }
          
          try {
            console.log("Trying registerForPushNotifications...");
            window.OneSignal.registerForPushNotifications();
          } catch (error) {
            console.error("registerForPushNotifications failed:", error);
          }
        });
      }, 3000);
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