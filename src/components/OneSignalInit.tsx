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
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const initializeOneSignal = async () => {
    console.log('[OneSignal] Starting initialization...');

    if (!window.OneSignal) {
      console.error('[OneSignal] OneSignal not available');
      return false;
    }

    try {
      await window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false, // We'll handle registration manually
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

      console.log('[OneSignal] Initialization successful!');
      window.OneSignalInitialized = true;

      // Set up event listeners
      window.OneSignal.on(
        'subscriptionChange',
        function (isSubscribed: boolean) {
          console.log('[OneSignal] Subscription changed:', isSubscribed);
          if (isSubscribed && userIdRef.current) {
            setExternalUserId(userIdRef.current);
          }
        },
      );

      return true;
    } catch (err) {
      console.error('[OneSignal] Initialization failed:', err);
      return false;
    }
  };

  const setExternalUserId = async (userId: string) => {
    try {
      await window.OneSignal.setExternalUserId(userId);
      console.log('[OneSignal] External user ID set:', userId);
    } catch (error) {
      console.error('[OneSignal] Failed to set external user ID:', error);
    }
  };

  const removeExternalUserId = async () => {
    try {
      await window.OneSignal.removeExternalUserId();
      console.log('[OneSignal] External user ID removed');
    } catch (error) {
      console.error('[OneSignal] Failed to remove external user ID:', error);
    }
  };

  const manageUserIdentity = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not ready for user management');
      return;
    }

    try {
      const currentExternalId = await window.OneSignal.getExternalUserId();
      const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();

      if (userId) {
        if (currentExternalId !== userId && isSubscribed) {
          console.log('[OneSignal] Setting external user ID:', userId);
          await setExternalUserId(userId);
        }
      } else {
        if (currentExternalId) {
          console.log('[OneSignal] Removing external user ID');
          await removeExternalUserId();
        }
      }
    } catch (error) {
      console.error('[OneSignal] User identity management failed:', error);
    }
  };

  const showNotificationPrompt = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not available for prompt');
      return;
    }

    try {
      const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
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
            await window.OneSignal.registerForPushNotifications();
          }
        }
      } else if (userId) {
        // User is already subscribed, set external ID
        await setExternalUserId(userId);
      }
    } catch (error) {
      console.error('[OneSignal] Prompt display failed:', error);
    }
  };

  const loadOneSignalScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Remove existing script if any
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

      script.onload = () => {
        console.log('[OneSignal] Script loaded successfully');
        resolve();
      };

      script.onerror = (e) => {
        console.error('[OneSignal] Script load error:', e);
        reject(e);
      };

      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    const setupOneSignal = async () => {
      try {
        // Check if OneSignal is already loaded
        if (!window.OneSignal) {
          await loadOneSignalScript();
          // Wait a bit for the script to be processed
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!window.OneSignalInitialized) {
          const success = await initializeOneSignal();
          if (success) {
            await manageUserIdentity();
            await showNotificationPrompt();
          }
        } else {
          console.log('[OneSignal] Already initialized');
          await manageUserIdentity();
        }
      } catch (error) {
        console.error('[OneSignal] Setup failed:', error);
      }
    };

    setupOneSignal();
  }, []);

  // Handle user ID changes
  useEffect(() => {
    if (window.OneSignalInitialized) {
      manageUserIdentity();
    }
  }, [userId]);

  return null;
}
