"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function TestNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Cek status subscription saat komponen mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(async () => {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        setIsSubscribed(isSubscribed);
      });
    }
  }, []);

  const handleShowPrompt = () => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(async () => {
        try {
          console.log("[Test] Showing slidedown prompt...");
          await window.OneSignal.showSlidedownPrompt();
        } catch (error) {
          console.warn("[Test] Slidedown failed, trying native prompt...", error);
          try {
            await window.OneSignal.showNativePrompt();
          } catch (nativeError) {
            console.warn("[Test] Native prompt failed, using direct registration...", nativeError);
            await window.OneSignal.registerForPushNotifications();
          }
        }
      });
    } else {
      console.warn("[Test] OneSignal not available");
    }
  };

  const handleRequestPermission = () => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(async () => {
        try {
          const granted = await window.OneSignal.requestPermission();
          console.log("[Test] Permission granted:", granted);
          setIsSubscribed(granted);
        } catch (error) {
          console.error("[Test] Permission request failed:", error);
        }
      });
    }
  };

  const handleSendTestNotification = () => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(async () => {
        try {
          const deviceId = await window.OneSignal.getDeviceId();
          if (!deviceId) {
            console.warn("[Test] No device ID found");
            return;
          }

          console.log("[Test] Sending test notification to:", deviceId);

          // Kirim notifikasi ke device ini
          window.OneSignal.postNotification({
            headings: { en: "Test Notification" },
            contents: { en: "Ini adalah notifikasi uji coba!" },
            include_player_ids: [deviceId],
          });
        } catch (error) {
          console.error("[Test] Failed to send test notification:", error);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md bg-gray-50">
      <h3 className="font-semibold">Test Notification Tools</h3>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleShowPrompt} variant="outline">
          Show Slidedown Prompt
        </Button>

        <Button onClick={handleRequestPermission} variant="outline">
          Request Permission
        </Button>

        <Button onClick={handleSendTestNotification} disabled={!isSubscribed}>
          Send Test Notification
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        {isSubscribed ? "✅ Already subscribed" : "⚠️ Not subscribed yet"}
      </p>
    </div>
  );
}