import { Expo } from "expo-server-sdk";

let expo = new Expo();

export const sendPushNotification = async (fcmToken, title, body) => {
  if (!Expo.isExpoPushToken(fcmToken)) {
    console.warn("Invalid Expo Push Token");
    return;
  }

  const message = {
    to: fcmToken,
    sound: "default",
    title: title,
    body: body,
    data: { extraData: "Some additional data" },
  };

  try {
    const response = await expo.sendPushNotificationsAsync([message]);
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Error sending notification:", error.message || error);
  }
};
