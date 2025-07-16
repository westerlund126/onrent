'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    OneSignal: any;
  }
}

const ONESIGNAL_APP_ID = '61505641-03dc-4eb9-91a6-178833446fbd';

export default function OneSignalInit({ userId }: { userId?: string }) {
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  // Helper: Setup user ID eksternal
  const setupUser = (id?: string) => {
    if (!id || !window.OneSignal?.setExternalUserId) return;
    console.log('[OneSignal] Setting external user ID:', id);
    window.OneSignal.setExternalUserId(id);
  };

  // Helper: Tampilkan prompt notifikasi
  const showNotificationPrompt = async () => {
    if (!window.OneSignal) {
      console.warn('[OneSignal] SDK tidak tersedia saat meminta izin.');
      return;
    }

    window.OneSignal.push(async () => {
      try {
        const isSubscribed =
          await window.OneSignal.isPushNotificationsEnabled();
        console.log(
          '[OneSignal] Status langganan:',
          isSubscribed ? 'Sudah berlangganan' : 'Belum berlangganan',
        );

        if (!isSubscribed) {
          try {
            await window.OneSignal.showSlidedownPrompt();
            console.log('[OneSignal] Slidedown prompt ditampilkan.');
          } catch (slideError) {
            console.warn(
              '[OneSignal] Slidedown gagal, mencoba native prompt...',
              slideError,
            );
            try {
              await window.OneSignal.showNativePrompt();
              console.log('[OneSignal] Native prompt ditampilkan.');
            } catch (nativeError) {
              console.warn(
                '[OneSignal] Native prompt gagal, menggunakan register langsung...',
                nativeError,
              );
              window.OneSignal.registerForPushNotifications();
            }
          }
        }
      } catch (error) {
        console.error('[OneSignal] Gagal menampilkan prompt:', error);
      }
    });
  };

  // Fungsi utama inisialisasi OneSignal
  const initializeOneSignal = async () => {
    console.log('[OneSignal] Memulai inisialisasi...');

    // Pastikan OneSignal array exists
    if (!window.OneSignal) {
      window.OneSignal = [];
    }

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
              'Kami ingin mengirimkan notifikasi tentang pembaruan penyewaan Anda.',
            acceptButtonText: 'Izinkan',
            cancelButtonText: 'Tidak, Terima Kasih',
          },
        },
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
      })
        .then(() => {
          console.log('[OneSignal] Inisialisasi berhasil!');
          window.OneSignal.initialized = true;

          setupUser(userId);
          showNotificationPrompt();
        })
        .catch((err: any) => {
          console.error('[OneSignal] Inisialisasi gagal:', err);
        });
    });
  };

  // Check if script is properly loaded and OneSignal is available
  const checkScriptReady = (callback: () => void, maxAttempts = 10) => {
    let attempts = 0;

    const checkInterval = setInterval(() => {
      attempts++;

      if (window.OneSignal && typeof window.OneSignal.init === 'function') {
        clearInterval(checkInterval);
        console.log('[OneSignal] SDK ready after', attempts, 'attempts');
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error(
          '[OneSignal] SDK tidak ready setelah',
          maxAttempts,
          'attempts',
        );
        // Try alternative initialization method
        tryAlternativeInit();
      }
    }, 200);
  };

  // Alternative initialization method
  const tryAlternativeInit = () => {
    console.log('[OneSignal] Mencoba metode alternatif...');

    // Create a new script element with different approach
    const script = document.createElement('script');
    script.innerHTML = `
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(function() {
        window.OneSignal.init({
          appId: "${ONESIGNAL_APP_ID}",
          allowLocalhostAsSecureOrigin: true,
          autoResubscribe: true,
          autoRegister: false,
          debug: true,
          promptOptions: {
            slidedown: {
              enabled: true,
              actionMessage: "Kami ingin mengirimkan notifikasi tentang pembaruan penyewaan Anda.",
              acceptButtonText: "Izinkan",
              cancelButtonText: "Tidak, Terima Kasih",
            },
          },
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "OneSignalSDKWorker.js",
        }).then(function() {
          console.log("[OneSignal] Inisialisasi alternatif berhasil!");
          window.OneSignal.initialized = true;
        }).catch(function(err) {
          console.error("[OneSignal] Inisialisasi alternatif gagal:", err);
        });
      });
    `;

    document.head.appendChild(script);
  };

  // Load SDK dengan improved error handling
  const loadOneSignalScript = () => {
    // Check if already exists
    const existingScript = document.getElementById('oneSignalSDK');
    if (existingScript) {
      console.log('[OneSignal] Script sudah dimuat sebelumnya.');
      existingScript.remove(); // Remove and reload
    }

    console.log('[OneSignal] Loading SDK script...');

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    script.id = 'oneSignalSDK';
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('[OneSignal] Script loaded successfully');
      // Wait a bit and check if OneSignal is properly initialized
      setTimeout(() => {
        if (window.OneSignal && typeof window.OneSignal === 'object') {
          console.log('[OneSignal] OneSignal object detected');
          checkScriptReady(() => {
            initializeOneSignal();
          });
        } else {
          console.error(
            '[OneSignal] OneSignal object not found after script load',
          );
          tryAlternativeInit();
        }
      }, 100);
    };

    script.onerror = (e) => {
      console.error('[OneSignal] Script load error:', e);
      console.error('[OneSignal] Error details:', {
        src: script.src,
        readyState: document.readyState,
        userAgent: navigator.userAgent,
      });

      // Try direct initialization without external script
      tryDirectInitialization();
    };

    // Add to head
    document.head.appendChild(script);
  };

  // Direct initialization method as last resort
  const tryDirectInitialization = () => {
    console.log('[OneSignal] Trying direct initialization...');

    // Initialize OneSignal array if not exists
    window.OneSignal = window.OneSignal || [];

    // Try to load via dynamic import or fetch
    fetch('https://cdn.onesignal.com/sdks/OneSignalSDK.js')
      .then((response) => response.text())
      .then((scriptContent) => {
        // Create script element with the fetched content
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.head.appendChild(script);

        // Wait and initialize
        setTimeout(() => {
          if (window.OneSignal) {
            initializeOneSignal();
          }
        }, 500);
      })
      .catch((error) => {
        console.error('[OneSignal] Direct initialization failed:', error);
        console.log(
          '[OneSignal] All initialization methods failed. Please check:',
        );
        console.log('1. Network connectivity');
        console.log('2. Content Security Policy settings');
        console.log('3. Browser compatibility');
        console.log('4. Ad blockers or security extensions');
      });
  };

  // Main effect
  useEffect(() => {
    if (initializedRef.current) {
      console.log('[OneSignal] Already initialized, skipping...');
      return;
    }
    initializedRef.current = true;

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('[OneSignal] Not in browser environment, skipping...');
      return;
    }

    // Check if already initialized
    if (window.OneSignal?.initialized) {
      console.log('[OneSignal] Already initialized previously.');
      setupUser(userId);
      showNotificationPrompt();
      return;
    }

    // Check if SDK exists but not initialized
    if (window.OneSignal && !window.OneSignal.initialized) {
      console.log('[OneSignal] SDK available but not initialized.');
      initializeOneSignal();
      return;
    }

    // Load SDK if not loaded
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;

      // Ensure DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadOneSignalScript);
      } else {
        // Small delay to ensure everything is settled
        setTimeout(loadOneSignalScript, 100);
      }
    }
  }, [userId]);

  return null;
}
