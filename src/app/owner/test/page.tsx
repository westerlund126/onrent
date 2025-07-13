'use client';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Send,
  User,
  Settings,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

declare global {
  interface Window {
    OneSignal: any;
    OneSignalDeferred: any[];
  }
}

export default function OneSignalTestPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [userId, setUserId] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [loading, setLoading] = useState({
    init: false,
    subscribe: false,
    unsubscribe: false,
    notification: false,
  });
  const [lastNotification, setLastNotification] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const addDebugInfo = (message: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Initialize OneSignal
  useEffect(() => {
    if (typeof window !== 'undefined' && !scriptLoaded) {
      addDebugInfo('Starting OneSignal initialization...');

      // Check if OneSignal is already available
      if (window.OneSignal) {
        addDebugInfo('OneSignal already available globally');
        setScriptLoaded(true);
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector(
        'script[src*="OneSignalSDK"]',
      );
      if (existingScript) {
        addDebugInfo('OneSignal script already exists');
        setScriptLoaded(true);
        return;
      }

      // Check security context
      if (!window.isSecureContext) {
        addDebugInfo(
          'ERROR: Not in secure context (HTTPS required for notifications)',
        );
        return;
      }

      // Add OneSignal script
      const script = document.createElement('script');
      script.src =
        'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      script.async = true;

      script.onload = () => {
        addDebugInfo('OneSignal script loaded successfully');
        setScriptLoaded(true);
      };

      script.onerror = (error) => {
        addDebugInfo(`ERROR: Failed to load OneSignal script: ${error}`);
      };

      document.head.appendChild(script);
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded && !isInitialized) {
      addDebugInfo('Script loaded, waiting for OneSignal to be available...');

      // Wait for OneSignal to be available
      const checkOneSignal = () => {
        if (window.OneSignal) {
          addDebugInfo('OneSignal is now available, initializing...');
          initializeOneSignal();
        } else {
          addDebugInfo('OneSignal not yet available, retrying in 100ms...');
          setTimeout(checkOneSignal, 100);
        }
      };

      checkOneSignal();
    }
  }, [scriptLoaded, isInitialized]);

  const initializeOneSignal = async () => {
    try {
      addDebugInfo('Calling OneSignal.init()...');

      await window.OneSignal.init({
        appId: '61505641-03dc-4eb9-91a6-178833446fbd',
        safari_web_id: 'web.onesignal.auto.YOUR_SAFARI_WEB_ID', // Replace with your Safari Web ID if needed
        notifyButton: {
          enable: false, // Disable the default notify button
        },
        allowLocalhostAsSecureOrigin: true, // For development
      });

      addDebugInfo('OneSignal.init() completed successfully');
      setIsInitialized(true);

      // Get initial states
      await updateUserStates();

      // Set up event listeners
      setupEventListeners();
    } catch (error) {
      addDebugInfo(`ERROR during initialization: ${error}`);
      console.error('OneSignal initialization error:', error);
    }
  };

  const updateUserStates = async () => {
    try {
      // Check current subscription status
      const subscribed = await window.OneSignal.User.PushSubscription.optedIn;
      setIsSubscribed(subscribed);
      addDebugInfo(`Subscription status: ${subscribed}`);

      // Get permission state
      const permissionState = await window.OneSignal.Notifications.permission;
      setPermission(permissionState);
      addDebugInfo(`Permission state: ${permissionState}`);

      // Get user ID
      const userIdValue = await window.OneSignal.User.onesignalId;
      setUserId(userIdValue || '');
      addDebugInfo(`User ID: ${userIdValue || 'Not available'}`);

      // Get push token
      const tokenValue = await window.OneSignal.User.PushSubscription.token;
      setPushToken(tokenValue || '');
      addDebugInfo(`Push token: ${tokenValue ? 'Available' : 'Not available'}`);
    } catch (error) {
      addDebugInfo(`Error updating user states: ${error}`);
      console.error('Error updating user states:', error);
    }
  };

  const setupEventListeners = () => {
    try {
      // Listen for subscription changes
      window.OneSignal.User.PushSubscription.addEventListener(
        'change',
        (event: any) => {
          setIsSubscribed(event.current.optedIn);
          setPushToken(event.current.token || '');
          addDebugInfo(`Subscription changed: ${event.current.optedIn}`);
        },
      );

      // Listen for notification clicks
      window.OneSignal.Notifications.addEventListener('click', (event: any) => {
        setLastNotification(`Clicked: ${event.notification.title}`);
        addDebugInfo(`Notification clicked: ${event.notification.title}`);
      });

      // Listen for permission changes
      window.OneSignal.Notifications.addEventListener(
        'permissionChange',
        (event: any) => {
          setPermission(event.to);
          addDebugInfo(`Permission changed to: ${event.to}`);
        },
      );

      addDebugInfo('Event listeners set up successfully');
    } catch (error) {
      addDebugInfo(`Error setting up event listeners: ${error}`);
      console.error('Error setting up event listeners:', error);
    }
  };

  const requestPermission = async () => {
    if (!isInitialized) {
      addDebugInfo('Cannot request permission - OneSignal not initialized');
      return;
    }

    addDebugInfo('Requesting notification permission...');
    setLoading((prev) => ({ ...prev, init: true }));

    try {
      // Check if we're in a secure context (HTTPS)
      if (!window.isSecureContext) {
        addDebugInfo('ERROR: Not in secure context (HTTPS required)');
        return;
      }

      const permission =
        await window.OneSignal.Notifications.requestPermission();
      setPermission(permission);
      addDebugInfo(`Permission result: ${permission}`);

      // Update user states after permission change
      await updateUserStates();
    } catch (error) {
      console.error('Error requesting permission:', error);
      addDebugInfo(`ERROR requesting permission: ${error}`);
    } finally {
      setLoading((prev) => ({ ...prev, init: false }));
    }
  };

  const subscribeUser = async () => {
    if (!isInitialized) {
      addDebugInfo('Cannot subscribe - OneSignal not initialized');
      return;
    }

    addDebugInfo('Subscribing user...');
    setLoading((prev) => ({ ...prev, subscribe: true }));

    try {
      await window.OneSignal.User.PushSubscription.optIn();
      setIsSubscribed(true);
      addDebugInfo('Successfully subscribed user');

      // Update user states after subscription
      await updateUserStates();
    } catch (error) {
      console.error('Error subscribing:', error);
      addDebugInfo(`ERROR subscribing: ${error}`);
    } finally {
      setLoading((prev) => ({ ...prev, subscribe: false }));
    }
  };

  const unsubscribeUser = async () => {
    if (!isInitialized) {
      addDebugInfo('Cannot unsubscribe - OneSignal not initialized');
      return;
    }

    addDebugInfo('Unsubscribing user...');
    setLoading((prev) => ({ ...prev, unsubscribe: true }));

    try {
      await window.OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
      addDebugInfo('Successfully unsubscribed user');

      // Update user states after unsubscription
      await updateUserStates();
    } catch (error) {
      console.error('Error unsubscribing:', error);
      addDebugInfo(`ERROR unsubscribing: ${error}`);
    } finally {
      setLoading((prev) => ({ ...prev, unsubscribe: false }));
    }
  };

  const sendTestNotification = async () => {
    if (!isInitialized || !userId) {
      addDebugInfo(
        'Cannot send notification - OneSignal not initialized or no user ID',
      );
      return;
    }

    addDebugInfo('Attempting to send test notification...');
    setLoading((prev) => ({ ...prev, notification: true }));

    try {
      // This would typically be done from your backend
      // Here we're just simulating what a test notification would look like
      setLastNotification(
        'Test notification sent! (In production, send from your backend)',
      );
      addDebugInfo(
        'Test notification simulated (use backend API for real notifications)',
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      addDebugInfo(`ERROR sending notification: ${error}`);
    } finally {
      setLoading((prev) => ({ ...prev, notification: false }));
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPermissionColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-600 bg-green-50';
      case 'denied':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Bell className="h-6 w-6" />
            OneSignal Notification Test
          </h1>

          {/* Debug Section */}
          <div className="mb-6 rounded-lg bg-gray-800 p-4 text-green-400">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-green-300">Debug Console</h3>
              <button
                onClick={clearDebugInfo}
                className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto font-mono text-xs">
              {debugInfo.length === 0 ? (
                <div className="text-gray-500">No debug info yet...</div>
              ) : (
                debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">
                    {info}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Script Loaded:</span>
                  <span
                    className={`text-sm font-medium ${
                      scriptLoaded ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {scriptLoaded ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Initialized:</span>
                  <span
                    className={`text-sm font-medium ${
                      isInitialized ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isInitialized ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subscribed:</span>
                  <span
                    className={`text-sm font-medium ${
                      isSubscribed ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isSubscribed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Permission:</span>
                  <div
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${getPermissionColor()}`}
                  >
                    {getPermissionIcon()}
                    {permission}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">User Info</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">User ID:</span>
                  <p className="mt-1 break-all rounded bg-white p-1 font-mono text-xs">
                    {userId || 'Not available'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Push Token:</span>
                  <p className="mt-1 break-all rounded bg-white p-1 font-mono text-xs">
                    {pushToken || 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={requestPermission}
              disabled={loading.init || permission === 'granted'}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading.init ? (
                <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Request Permission
            </button>

            <button
              onClick={subscribeUser}
              disabled={
                loading.subscribe || isSubscribed || permission !== 'granted'
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading.subscribe ? (
                <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Subscribe
            </button>

            <button
              onClick={unsubscribeUser}
              disabled={loading.unsubscribe || !isSubscribed}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading.unsubscribe ? (
                <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Unsubscribe
            </button>

            <button
              onClick={sendTestNotification}
              disabled={loading.notification || !isSubscribed}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading.notification ? (
                <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Test Notification
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              Instructions & Troubleshooting
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <strong>Basic Flow:</strong>
                <ol className="mt-1 list-inside list-decimal space-y-1">
                  <li>Wait for script to load and OneSignal to initialize</li>
                  <li>
                    Click "Request Permission" to ask for notification
                    permissions
                  </li>
                  <li>
                    Click "Subscribe" to subscribe the user to notifications
                  </li>
                  <li>
                    Use the User ID to send notifications from your backend
                  </li>
                </ol>
              </div>

              <div>
                <strong>Common Issues:</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>
                    <strong>HTTPS Required:</strong> Notifications only work on
                    HTTPS sites
                  </li>
                  <li>
                    <strong>Domain Configuration:</strong> Make sure your domain
                    is configured in OneSignal dashboard
                  </li>
                  <li>
                    <strong>Browser Blocking:</strong> Some browsers block
                    notifications by default
                  </li>
                  <li>
                    <strong>Incognito Mode:</strong> Notifications may not work
                    in private browsing
                  </li>
                  <li>
                    <strong>Service Worker:</strong> Ensure
                    _OneSignalSDKWorker.js is accessible at your domain root
                  </li>
                </ul>
              </div>

              <div>
                <strong>Required Files in /public:</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>_OneSignalSDKWorker.js (Service Worker)</li>
                  <li>OneSignalSDKUpdaterWorker.js (Optional, for updates)</li>
                </ul>
              </div>

              <div>
                <strong>
                  Check Debug Console above for detailed error messages
                </strong>
              </div>
            </div>
          </div>

          {/* Last Notification */}
          {lastNotification && (
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">Last Action</h3>
              <p className="text-sm text-green-700">{lastNotification}</p>
            </div>
          )}

          {/* API Example */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-700">
              Backend API Example
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              To send notifications from your backend, use this cURL example:
            </p>
            <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-green-400">
              {`curl -X POST https://onesignal.com/api/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Basic YOUR_REST_API_KEY" \\
  -d '{
    "app_id": "61505641-03dc-4eb9-91a6-178833446fbd",
    "include_external_user_ids": ["${userId}"],
    "headings": {"en": "Test Notification"},
    "contents": {"en": "This is a test notification from your backend!"}
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
