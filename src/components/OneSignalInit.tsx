'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

declare global {
  interface Window {
    OneSignal: any;
    OneSignalInitialized?: boolean;
  }
}

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export default function OneSignalInit() {
  const { userId, isSignedIn } = useAuth();
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

    // Wait for OneSignal to be fully ready
    if (typeof window.OneSignal.init !== 'function') {
      console.log('[OneSignal] Waiting for OneSignal to be ready...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (typeof window.OneSignal.init !== 'function') {
        console.error('[OneSignal] OneSignal.init still not available');
        return false;
      }
    }

    try {
      await window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false,
        debug: process.env.NODE_ENV === 'development',
        promptOptions: {
          slidedown: {
            enabled: true,
            actionMessage:
              'Kami ingin mengirimkan notifikasi tentang pembaruan rental dan fitting Anda.',
            acceptButtonText: 'Izinkan',
            cancelButtonText: 'Tidak, Terima Kasih',
          },
        },
        notificationClickHandlerMatch: 'origin',
        notificationClickHandlerAction: 'navigate',
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      });

      console.log('[OneSignal] Initialization successful!');
      window.OneSignalInitialized = true;

      // Wait a bit more for OneSignal to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set up subscription change listener - check if method exists first
      if (typeof window.OneSignal.on === 'function') {
        window.OneSignal.on('subscriptionChange', function (isSubscribed: boolean) {
          console.log('[OneSignal] Subscription changed:', isSubscribed);
          if (isSubscribed && userIdRef.current) {
            setExternalUserId(userIdRef.current);
          }
        });
      } else {
        console.warn('[OneSignal] .on method not available, skipping event listener');
      }

      return true;
    } catch (err) {
      console.error('[OneSignal] Initialization failed:', err);
      return false;
    }
  };

  const setExternalUserId = async (userId: string) => {
    try {
      if (typeof window.OneSignal.setExternalUserId === 'function') {
        await window.OneSignal.setExternalUserId(userId);
        console.log('[OneSignal] External user ID set:', userId);
      } else {
        console.error('[OneSignal] setExternalUserId not available');
      }
    } catch (error) {
      console.error('[OneSignal] Failed to set external user ID:', error);
    }
  };

  const logoutUser = async () => {
    try {
      if (typeof window.OneSignal.logout === 'function') {
        await window.OneSignal.logout();
        console.log('[OneSignal] Logged out external user');
      } else {
        console.error('[OneSignal] logout not available');
      }
    } catch (error) {
      console.error('[OneSignal] Logout failed:', error);
    }
  };

  const manageUserIdentity = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not ready for user management');
      return;
    }

    try {
      if (isSignedIn && userId) {
        // User is signed in, set their external ID
        if (typeof window.OneSignal.getExternalUserId === 'function') {
          const currentExternalId = await window.OneSignal.getExternalUserId();
          if (currentExternalId !== userId) {
            console.log('[OneSignal] Setting new external user ID:', userId);
            await setExternalUserId(userId);
          } else {
            console.log('[OneSignal] External user ID is already set correctly.');
          }
        } else {
          // Fallback - just try to set it
          await setExternalUserId(userId);
        }
      } else {
        // User is not signed in, check if there's an ID to log out
        if (typeof window.OneSignal.getExternalUserId === 'function') {
          const currentExternalId = await window.OneSignal.getExternalUserId();
          if (currentExternalId) {
            console.log('[OneSignal] User signed out, logging out from OneSignal');
            await logoutUser();
          }
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

    // Only show prompt if user is signed in
    if (!isSignedIn || !userId) {
      console.log('[OneSignal] User not signed in, skipping prompt');
      return;
    }

    try {
      let isSubscribed = false;
      
      if (typeof window.OneSignal.isPushNotificationsEnabled === 'function') {
        isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
      } else if (typeof window.OneSignal.getNotificationPermission === 'function') {
        const permission = await window.OneSignal.getNotificationPermission();
        isSubscribed = permission === 'granted';
      }
      
      console.log('[OneSignal] Subscription status:', isSubscribed ? 'Subscribed' : 'Not subscribed');

      if (!isSubscribed) {
        try {
          if (typeof window.OneSignal.showSlidedownPrompt === 'function') {
            await window.OneSignal.showSlidedownPrompt();
            console.log('[OneSignal] Slidedown prompt shown');
          } else if (typeof window.OneSignal.showNativePrompt === 'function') {
            await window.OneSignal.showNativePrompt();
            console.log('[OneSignal] Native prompt shown');
          } else if (typeof window.OneSignal.registerForPushNotifications === 'function') {
            await window.OneSignal.registerForPushNotifications();
            console.log('[OneSignal] Direct registration attempted');
          } else {
            console.error('[OneSignal] No prompt methods available');
          }
        } catch (promptError) {
          console.error('[OneSignal] All prompt methods failed:', promptError);
        }
      } else if (userId) {
        await setExternalUserId(userId);
      }
    } catch (error) {
      console.error('[OneSignal] Prompt display failed:', error);
    }
  };

  const loadOneSignalScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Remove existing script
      const existingScript = document.getElementById('oneSignalSDK');
      if (existingScript) {
        existingScript.remove();
      }

      console.log('[OneSignal] Loading SDK script...');
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      script.id = 'oneSignalSDK';
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        console.log('[OneSignal] Script loaded successfully');
        // Wait for OneSignal object to be available
        const checkOneSignal = () => {
          if (window.OneSignal && typeof window.OneSignal === 'object') {
            console.log('[OneSignal] OneSignal object is available');
            resolve();
          } else {
            console.log('[OneSignal] Waiting for OneSignal object...');
            setTimeout(checkOneSignal, 100);
          }
        };
        checkOneSignal();
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
        if (!window.OneSignal) {
          await loadOneSignalScript();
          // Give it more time to initialize
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!window.OneSignalInitialized) {
          const success = await initializeOneSignal();
          if (success) {
            // Wait a bit before managing user identity
            await new Promise((resolve) => setTimeout(resolve, 200));
            await manageUserIdentity();
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

  useEffect(() => {
    const handleUserChange = async () => {
      if (!window.OneSignalInitialized) return;

      await manageUserIdentity();
      
      if (isSignedIn && userId) {
        setTimeout(() => {
          showNotificationPrompt();
        }, 2000);
      }
    };

    handleUserChange();
  }, [isSignedIn, userId]);

  return null;
}