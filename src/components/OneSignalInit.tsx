"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    OneSignal: any;
  }
}

export default function OneSignalInit({ userId }: { userId?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to set user ID
    const setupUser = (id?: string) => {
      if (id) {
        console.log("Setting external user ID:", id);
        window.OneSignal.setExternalUserId(id);
      }
    };

    // Helper function to show prompt
    const showNotificationPrompt = async () => {
      try {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        console.log("Subscription status:", isSubscribed);
        
        if (!isSubscribed) {
          console.log("Attempting to show prompt...");
          await window.OneSignal.showSlidedownPrompt();
          console.log("Prompt shown successfully");
        }
      } catch (error) {
        console.error("Prompt error:", error);
        // Fallback to native prompt
        window.OneSignal.showNativePrompt();
      }
    };

    // Initialize OneSignal queue if not exists
    window.OneSignal = window.OneSignal || [];
    
    // Only initialize once
    if (window.OneSignal.initialized) {
      console.log("OneSignal already initialized");
      setupUser(userId);
      showNotificationPrompt();
      return;
    }

    console.log("Starting OneSignal initialization...");

    // Initialization configuration
    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId: "61505641-03dc-4eb9-91a6-178833446fbd",
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false,
        promptOptions: {
          slidedown: {
            enabled: true,
            actionMessage: "We'd like to show you notifications for the latest news and updates about your rentals.",
            acceptButtonText: "Allow",
            cancelButtonText: "No Thanks"
          }
        }
      }).then(() => {
        console.log("OneSignal initialized successfully!");
        window.OneSignal.initialized = true;
        
        // Setup user AFTER initialization
        setupUser(userId);
        
        // Show prompt automatically
        showNotificationPrompt();
      }).catch((error: any) => {
        console.error("OneSignal initialization failed:", error);
      });
    });

    // Load SDK if not already loaded
    if (!document.getElementById("oneSignalSDK")) {
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
      script.async = true;
      script.id = "oneSignalSDK";
      document.head.appendChild(script);
    }
  }, [userId]);

  return null;
}