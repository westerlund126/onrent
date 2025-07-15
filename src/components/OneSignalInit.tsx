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
      if (id && window.OneSignal?.setExternalUserId) {
        console.log("Setting external user ID:", id);
        window.OneSignal.setExternalUserId(id);
      }
    };

    // Helper function to show prompt
    const showNotificationPrompt = async () => {
      try {
        if (!window.OneSignal) {
          console.error("OneSignal not available for prompt");
          return;
        }

        // Check subscription status
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        console.log("Subscription status:", isSubscribed);
        
        if (!isSubscribed) {
          console.log("Attempting to show prompt...");
          
          // Try slidedown prompt
          try {
            await window.OneSignal.showSlidedownPrompt();
            console.log("Slidedown prompt shown successfully");
          } catch (slidedownError) {
            console.error("Slidedown prompt failed:", slidedownError);
            
            // Fallback to native prompt
            try {
              await window.OneSignal.showNativePrompt();
              console.log("Native prompt shown successfully");
            } catch (nativeError) {
              console.error("Native prompt failed:", nativeError);
              
              // Final fallback to direct registration
              window.OneSignal.registerForPushNotifications();
            }
          }
        }
      } catch (error) {
        console.error("Error in notification prompt flow:", error);
      }
    };

    // Main initialization function
    const initializeOneSignal = async () => {
      console.log("Starting OneSignal initialization...");
      
      // Initialize OneSignal queue if not exists
      window.OneSignal = window.OneSignal || [];
      
      // Only initialize once
      if (window.OneSignal.initialized) {
        console.log("OneSignal already initialized");
        setupUser(userId);
        showNotificationPrompt();
        return;
      }

      // Push initialization to OneSignal queue
      window.OneSignal.push(() => {
        window.OneSignal.init({
          appId: "61505641-03dc-4eb9-91a6-178833446fbd",
          allowLocalhostAsSecureOrigin: true,
          autoResubscribe: true,
          autoRegister: false,
          debug: true, // Enable detailed logging
          promptOptions: {
            slidedown: {
              enabled: true,
              actionMessage: "We'd like to show you notifications for the latest news and updates about your rentals.",
              acceptButtonText: "Allow",
              cancelButtonText: "No Thanks"
            }
          },
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: "OneSignalSDKWorker.js"
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
    };

    // Load OneSignal SDK
    const loadOneSignalSDK = () => {
      if (document.getElementById("oneSignalSDK")) return;
      
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
      script.async = true;
      script.id = "oneSignalSDK";
      script.onload = () => {
        console.log("OneSignal script loaded");
        initializeOneSignal();
      };
      script.onerror = (error) => {
        console.error("Failed to load OneSignal script:", error);
      };
      document.head.appendChild(script);
    };

    // Check if OneSignal is already available
    if (window.OneSignal && window.OneSignal.initialized) {
      console.log("OneSignal already available");
      setupUser(userId);
      showNotificationPrompt();
    } else if (window.OneSignal) {
      console.log("OneSignal available but not initialized");
      initializeOneSignal();
    } else {
      console.log("Loading OneSignal SDK");
      loadOneSignalSDK();
    }
  }, [userId]);

  return null;
}