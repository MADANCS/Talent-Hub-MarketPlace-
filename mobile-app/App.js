import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      // For local development without EAS
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
    console.log("EXPO PUSH TOKEN:", token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      // TODO: Send this token to backend to update user profile
      // API.post('/users/update-push-token', { expoPushToken: token })
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JobSleuths Mobile</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Your Expo Push Token:</Text>
        <Text style={styles.tokenText}>{expoPushToken || 'Fetching...'}</Text>
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
        <Text>Latest Notification: {notification ? notification.request.content.title : 'None'}</Text>
        <Text>{notification ? notification.request.content.body : ''}</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button
          title="Simulate Push Notification"
          onPress={async () => {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "You've got a new job match! 🚀",
                body: "A top company is looking for your React Native skills.",
                data: { data: 'goes here' },
              },
              trigger: { seconds: 2 },
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2ef',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#0f172a'
  },
  tokenText: {
    fontSize: 10,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
  }
});
