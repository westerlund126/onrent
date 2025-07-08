// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCnXGT3Rk2AYrX67x3kMDfQ0XWB4jTowGU",
    authDomain: "on-rent-6c51c.firebaseapp.com",
    projectId: "on-rent-6c51c",
    storageBucket: "on-rent-6c51c.firebasestorage.app",
    messagingSenderId: "871095740783",
    appId: "1:871095740783:web:e2d2591839eae3c011209a"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
