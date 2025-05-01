import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const sendPushNotification = async (fcmToken, title, body) => {
  if (!fcmToken) {
    console.warn("No FCM token provided");
    return;
  }

  const message = {
    token: fcmToken,
    notification: { title, body },
  };

  try {
    const response = await getMessaging().send(message);
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Error sending notification:", error.message || error);
  }
};
