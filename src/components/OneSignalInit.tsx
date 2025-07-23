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
  const subscriptionListenerSetup = useRef(false);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const waitForOneSignalReady = async (maxWait = 5000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (window.OneSignal && 
          typeof window.OneSignal.init === 'function' &&
          window.OneSignal.User &&
          window.OneSignal.Slidedown) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  };

  const initializeOneSignal = async () => {
    console.log('[OneSignal] Starting initialization...');

    if (!window.OneSignal) {
      console.error('[OneSignal] OneSignal not available');
      return false;
    }

    const isReady = await waitForOneSignalReady();
    if (!isReady) {
      console.error('[OneSignal] OneSignal failed to become ready');
      return false;
    }

    try {
      await window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false, // We'll handle registration manually
        debug: process.env.NODE_ENV === 'development',
        promptOptions: {
          slidedown: {
            enabled: true,
            actionMessage: 'Kami ingin mengirimkan notifikasi tentang pembaruan rental dan fitting Anda.',
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

      // Setup subscription listener
      await setupSubscriptionListener();

      return true;
    } catch (err) {
      console.error('[OneSignal] Initialization failed:', err);
      return false;
    }
  };

  const setupSubscriptionListener = async () => {
    if (subscriptionListenerSetup.current) return;
    
    try {
      // Wait for User object to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (window.OneSignal.User && window.OneSignal.User.PushSubscription) {
        // Set up property change listener for v16
        const checkSubscriptionChange = () => {
          if (window.OneSignal.User.PushSubscription.optedIn && userIdRef.current) {
            console.log('[OneSignal] User subscribed, setting external ID');
            setExternalUserId(userIdRef.current);
          }
        };

        // Check periodically for subscription changes
        setInterval(checkSubscriptionChange, 2000);
        subscriptionListenerSetup.current = true;
      }
    } catch (error) {
      console.warn('[OneSignal] Could not set up subscription listener:', error);
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      if (window.OneSignal && window.OneSignal.User && window.OneSignal.User.PushSubscription) {
        // Wait a moment for the object to be populated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const subscription = window.OneSignal.User.PushSubscription;
        
        return {
          optedIn: subscription.optedIn,
          permission: subscription.permission,
          token: subscription.token,
          id: subscription.id
        };
      }
      return null;
    } catch (error) {
      console.error('[OneSignal] Error getting subscription status:', error);
      return null;
    }
  };

  const setExternalUserId = async (userId: string) => {
    try {
      // First check if user is actually subscribed
      const status = await getSubscriptionStatus();
      if (!status || !status.optedIn) {
        console.log('[OneSignal] User not subscribed, skipping external ID');
        return;
      }

      if (window.OneSignal.User && typeof window.OneSignal.User.addAlias === 'function') {
        await window.OneSignal.User.addAlias('external_id', userId);
        console.log('[OneSignal] External user ID set:', userId);
      } else if (window.OneSignal.login && typeof window.OneSignal.login === 'function') {
        await window.OneSignal.login(userId);
        console.log('[OneSignal] User logged in with ID:', userId);
      } else {
        console.error('[OneSignal] No user identification method available');
      }
    } catch (error) {
      console.error('[OneSignal] Failed to set external user ID:', error);
    }
  };

  const logoutUser = async () => {
    try {
      if (window.OneSignal.logout && typeof window.OneSignal.logout === 'function') {
        await window.OneSignal.logout();
        console.log('[OneSignal] Logged out external user');
      } else if (window.OneSignal.User && typeof window.OneSignal.User.removeAlias === 'function') {
        await window.OneSignal.User.removeAlias('external_id');
        console.log('[OneSignal] Removed external user alias');
      }
    } catch (error) {
      console.error('[OneSignal] Logout failed:', error);
    }
  };

  const showNotificationPrompt = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not available for prompt');
      return;
    }

    if (!isSignedIn || !userId) {
      console.log('[OneSignal] User not signed in, skipping prompt');
      return;
    }

    try {
      const status = await getSubscriptionStatus();
      console.log('[OneSignal] Current subscription status:', status);

      if (!status || !status.optedIn) {
        // Try to register for push notifications first
        if (window.OneSignal.User && typeof window.OneSignal.User.PushSubscription.optIn === 'function') {
          console.log('[OneSignal] Attempting to opt in user...');
          await window.OneSignal.User.PushSubscription.optIn();
        } else if (typeof window.OneSignal.registerForPushNotifications === 'function') {
          console.log('[OneSignal] Using registerForPushNotifications...');
          await window.OneSignal.registerForPushNotifications();
        } else {
          console.error('[OneSignal] No registration methods available');
        }
      } else if (userId) {
        // User is already subscribed, just set the external ID
        await setExternalUserId(userId);
      }
    } catch (error) {
      console.error('[OneSignal] Notification prompt failed:', error);
    }
  };

  const manageUserIdentity = async () => {
    if (!window.OneSignal || !window.OneSignalInitialized) {
      console.warn('[OneSignal] SDK not ready for user management');
      return;
    }

    // Add a small delay to ensure OneSignal is fully ready
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (isSignedIn && userId) {
        console.log('[OneSignal] Managing user identity for:', userId);
        
        // Check if user is subscribed first
        const status = await getSubscriptionStatus();
        
        if (status && status.optedIn) {
          await setExternalUserId(userId);
        } else {
          console.log('[OneSignal] User not subscribed yet');
        }
      } else {
        console.log('[OneSignal] User signed out, logging out from OneSignal');
        await logoutUser();
      }
    } catch (error) {
      console.error('[OneSignal] User identity management failed:', error);
    }
  };

  const loadOneSignalScript = () => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('oneSignalSDK');
      if (existingScript) {
        existingScript.remove();
        // Reset initialization flags
        window.OneSignalInitialized = false;
        subscriptionListenerSetup.current = false;
      }

      console.log('[OneSignal] Loading SDK script...');
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      script.id = 'oneSignalSDK';
      script.crossOrigin = 'anonymous';

      script.onload = async () => {
        console.log('[OneSignal] Script loaded successfully');
        
        // Wait for OneSignal to be fully available
        const isReady = await waitForOneSignalReady();
        if (isReady) {
          console.log('[OneSignal] OneSignal object is ready');
          resolve();
        } else {
          reject(new Error('OneSignal object not ready after timeout'));
        }
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
        if (!window.OneSignal || !window.OneSignalInitialized) {
          await loadOneSignalScript();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!window.OneSignalInitialized) {
          const success = await initializeOneSignal();
          if (success) {
            await new Promise(resolve => setTimeout(resolve, 500));
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

  // Handle user sign in/out
  useEffect(() => {
    const handleUserChange = async () => {
      if (!window.OneSignalInitialized) return;

      await manageUserIdentity();
      
      if (isSignedIn && userId) {
        // Show notification prompt when user signs in
        setTimeout(() => {
          showNotificationPrompt();
        }, 1000);
      }
    };

    handleUserChange();
  }, [isSignedIn, userId]);

  return null;
}