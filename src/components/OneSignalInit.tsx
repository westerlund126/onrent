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
          autoRegister: false, // Changed to false to have more control
          promptOptions: {
            slidedown: {
              enabled: true,
              actionMessage: "We'd like to show you notifications for the latest news and updates about your rentals.",
              acceptButtonText: "Allow",
              cancelButtonText: "No Thanks"
            }
          }
        });
        
        // Set external user ID if provided
        if (userId) {
          console.log("Setting external user ID:", userId);
          window.OneSignal.setExternalUserId(userId);
        }
        
        // Check subscription status and show prompt accordingly
        window.OneSignal.isPushNotificationsEnabled().then(function(isEnabled) {
          console.log("Push notifications enabled:", isEnabled);
          
          if (!isEnabled) {
            console.log("User is not subscribed, showing prompt...");
            
            // Wait a bit more for full initialization
            setTimeout(() => {
              // Try slidedown prompt first
              window.OneSignal.showSlidedownPrompt().then(function() {
                console.log("Slidedown prompt shown successfully");
              }).catch(function(error) {
                console.error("Slidedown prompt failed:", error);
                
                // Fallback to native prompt
                window.OneSignal.showNativePrompt().then(function() {
                  console.log("Native prompt shown successfully");
                }).catch(function(error) {
                  console.error("Native prompt also failed:", error);
                  
                  // Last resort: direct registration
                  window.OneSignal.registerForPushNotifications();
                });
              });
            }, 1000);
          } else {
            console.log("User is already subscribed to push notifications");
            
            // Get the subscription info
            window.OneSignal.getUserId().then(function(userId) {
              console.log("OneSignal User ID:", userId);
            });
          }
        }).catch(function(error) {
          console.error("Error checking push notification status:", error);
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