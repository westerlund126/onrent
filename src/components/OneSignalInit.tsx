"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    OneSignal: any;
  }
}

const ONESIGNAL_APP_ID = "61505641-03dc-4eb9-91a6-178833446fbd";

export default function OneSignalInit({ userId }: { userId?: string }) {
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  // Helper: Setup user ID eksternal
  const setupUser = (id?: string) => {
    if (!id || !window.OneSignal?.setExternalUserId) return;
    console.log("[OneSignal] Setting external user ID:", id);
    window.OneSignal.setExternalUserId(id);
  };

  // Helper: Tampilkan prompt notifikasi
  const showNotificationPrompt = async () => {
    if (!window.OneSignal) {
      console.warn("[OneSignal] SDK tidak tersedia saat meminta izin.");
      return;
    }

    window.OneSignal.push(async () => {
      try {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        console.log("[OneSignal] Status langganan:", isSubscribed ? "Sudah berlangganan" : "Belum berlangganan");

        if (!isSubscribed) {
          try {
            await window.OneSignal.showSlidedownPrompt();
            console.log("[OneSignal] Slidedown prompt ditampilkan.");
          } catch (slideError) {
            console.warn("[OneSignal] Slidedown gagal, mencoba native prompt...", slideError);
            try {
              await window.OneSignal.showNativePrompt();
              console.log("[OneSignal] Native prompt ditampilkan.");
            } catch (nativeError) {
              console.warn("[OneSignal] Native prompt gagal, menggunakan register langsung...", nativeError);
              window.OneSignal.registerForPushNotifications();
            }
          }
        }
      } catch (error) {
        console.error("[OneSignal] Gagal menampilkan prompt:", error);
      }
    });
  };

  // Fungsi utama inisialisasi OneSignal
  const initializeOneSignal = async() => {
    console.log("[OneSignal] Memulai inisialisasi...");

    window.OneSignal = [];

    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false,
        debug: true,
        promptOptions: {
          slidedown: {
            enabled: true,
            actionMessage:
              "Kami ingin mengirimkan notifikasi tentang pembaruan penyewaan Anda.",
            acceptButtonText: "Izinkan",
            cancelButtonText: "Tidak, Terima Kasih",
          },
        },
        serviceWorkerParam: { scope: "/" },
        serviceWorkerPath: "OneSignalSDKWorker.js",
      })
        .then(() => {
          console.log("[OneSignal] Inisialisasi berhasil!");
          window.OneSignal.initialized = true;

          setupUser(userId);
          showNotificationPrompt();
        })
        .catch((err: any) => {
          console.error("[OneSignal] Inisialisasi gagal:", err);
        });
    });
  };

  // Load SDK hanya sekali
  const loadOneSignalScript = () => {
    if (document.getElementById("oneSignalSDK")) {
      console.log("[OneSignal] Script sudah dimuat sebelumnya.");
      initializeOneSignal();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
    script.async = true;
    script.id = "oneSignalSDK";
    script.onload = () => {
      console.log("[OneSignal] Script SDK berhasil dimuat.");
      initializeOneSignal();
    };
    script.onerror = (e) => {
      console.error("[OneSignal] Gagal memuat script SDK:", e);
    };
    document.head.appendChild(script);
  };

  // Efek utama
  useEffect(() => {
    if (initializedRef.current) {
      console.log("[OneSignal] Sudah pernah diinisialisasi. Melewatkan...");
      return;
    }
    initializedRef.current = true;


    // Jika sudah diinisialisasi sebelumnya
    if (window.OneSignal?.initialized) {
      console.log("[OneSignal] Sudah diinisialisasi sebelumnya.");
      setupUser(userId);
      showNotificationPrompt();
      return;
    }

    // Jika SDK ada tapi belum di-init
    if (window.OneSignal && !window.OneSignal.initialized) {
      console.log("[OneSignal] SDK tersedia tapi belum di-init.");
      initializeOneSignal();
      return;
    }

    // Jika SDK belum dimuat
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      loadOneSignalScript();
    }
  }, [userId]);

  return null;
}