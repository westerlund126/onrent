"use client";
import { Button } from "@/components/ui/button";

export default function TestNotificationButton() {
  const handleShowPrompt = () => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.showSlidedownPrompt();
      });
    }
  };

  const handleRequestPermission = () => {
    if (typeof window !== "undefined" && window.OneSignal) {
      window.OneSignal.push(function() {
        window.OneSignal.requestPermission();
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleShowPrompt}>
        Show Notification Prompt
      </Button>
      <Button onClick={handleRequestPermission}>
        Request Permission
      </Button>
    </div>
  );
}