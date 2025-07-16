'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    OneSignal: any;
    OneSignalInitialized?: boolean;
  }
}

const ONESIGNAL_APP_ID = '61505641-03dc-4eb9-91a6-178833446fbd';

export default function OneSignalInit({ userId }: { userId?: string }) {
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  const initializeOneSignal = async () => {
    console.log('[OneSignal] Starting initialization...');

    if (!window.OneSignal) {
      window.OneSignal = [];
    }

    try {
      await window.OneSignal.push(() => {
        return window.OneSignal.init({
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
        });
      });

      console.log('[OneSignal] Initialization successful!');
      window.OneSignalInitialized = true;
      return true;
    } catch (err) {
      console.error('[OneSignal] Initialization failed:', err);
      return false;
    }
  };

  const manageUserIdentity = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not ready for user management');
      return;
    }

    try {
      await window.OneSignal.push(async () => {
        const currentExternalId = await window.OneSignal.getExternalUserId();

        if (userId) {
          if (currentExternalId !== userId) {
            console.log('[OneSignal] Setting external user ID:', userId);
            await window.OneSignal.setExternalUserId(userId);
          }
        } else {
          if (currentExternalId) {
            console.log('[OneSignal] Removing external user ID');
            await window.OneSignal.removeExternalUserId();
          }
        }
      });
    } catch (error) {
      console.error('[OneSignal] User identity management failed:', error);
    }
  };

  const showNotificationPrompt = async () => {
    if (!window.OneSignal) {
      console.warn('[OneSignal] SDK not available for prompt');
      return;
    }

    try {
      await window.OneSignal.push(async () => {
        const isSubscribed =
          await window.OneSignal.isPushNotificationsEnabled();
        console.log(
          '[OneSignal] Subscription status:',
          isSubscribed ? 'Subscribed' : 'Not subscribed',
        );

        if (!isSubscribed) {
          try {
            await window.OneSignal.showSlidedownPrompt();
            console.log('[OneSignal] Slidedown prompt shown');
          } catch (slideError) {
            console.warn(
              '[OneSignal] Slidedown failed, trying native prompt...',
              slideError,
            );
            try {
              await window.OneSignal.showNativePrompt();
              console.log('[OneSignal] Native prompt shown');
            } catch (nativeError) {
              console.warn(
                '[OneSignal] Native prompt failed, using direct registration...',
                nativeError,
              );
              window.OneSignal.registerForPushNotifications();
            }
          }
        }
      });
    } catch (error) {
      console.error('[OneSignal] Prompt display failed:', error);
    }
  };

  const tryAlternativeInit = () => {
    console.log('[OneSignal] Trying alternative initialization...');

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
          console.log("[OneSignal] Alternative initialization successful!");
          window.OneSignalInitialized = true;
        }).catch(function(err) {
          console.error("[OneSignal] Alternative initialization failed:", err);
        });
      });
    `;
    document.head.appendChild(script);
  };

  const tryDirectInitialization = () => {
    console.log('[OneSignal] Trying direct initialization...');

    window.OneSignal = window.OneSignal || [];

    fetch('https://cdn.onesignal.com/sdks/OneSignalSDK.js')
      .then((response) => response.text())
      .then((scriptContent) => {
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.head.appendChild(script);

        setTimeout(() => {
          if (window.OneSignal) {
            initializeOneSignal();
          }
        }, 500);
      })
      .catch((error) => {
        console.error('[OneSignal] Direct initialization failed:', error);
      });
  };

  const loadOneSignalScript = () => {
    const existingScript = document.getElementById('oneSignalSDK');
    if (existingScript) {
      existingScript.remove();
    }

    console.log('[OneSignal] Loading SDK script...');
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    script.id = 'oneSignalSDK';
    script.crossOrigin = 'anonymous';

    script.onload = async () => {
      console.log('[OneSignal] Script loaded successfully');

      try {
        const initSuccess = await initializeOneSignal();

        if (initSuccess) {
          await manageUserIdentity();
          await showNotificationPrompt();
        } else {
          tryAlternativeInit();
        }
      } catch (error) {
        console.error('[OneSignal] Initialization failed after load:', error);
        tryAlternativeInit();
      }
    };

    script.onerror = (e) => {
      console.error('[OneSignal] Script load error:', e);
      tryDirectInitialization();
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (initializedRef.current) return;
    initializedRef.current = true;

    if (window.OneSignalInitialized) {
      console.log('[OneSignal] Already initialized');
      manageUserIdentity();
      return;
    }

    if (window.OneSignal && !window.OneSignalInitialized) {
      console.log('[OneSignal] SDK available but not initialized');
      initializeOneSignal().then(() => {
        manageUserIdentity();
        showNotificationPrompt();
      });
      return;
    }

    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      loadOneSignalScript();
    }
  }, [userId]);

  return null;
}
