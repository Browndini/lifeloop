import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format
  daysOfWeek: number[]; // 0-6, Sunday = 0
}

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const NOTIFICATION_ID_KEY = '@last_notification_id';

const defaultSettings: NotificationSettings = {
  enabled: false,
  time: '20:00',
  daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private notificationId: string | null = null;

  async initialize() {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permission');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Daily Reminder',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Load last notification ID
    try {
      this.notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    } catch (error) {
      console.error('Error loading notification ID:', error);
    }

    return true;
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      await this.scheduleNotification(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  private async scheduleNotification(settings: NotificationSettings): Promise<void> {
    if (!settings.enabled) {
      if (this.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationId);
        this.notificationId = null;
        await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
      }
      return;
    }

    // Cancel existing notification
    if (this.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(this.notificationId);
    }

    const [hours, minutes] = settings.time.split(':').map(Number);
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    } as any;

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: `daily-reminder-${Date.now()}`,
      content: {
        title: 'LifeLoop Reminder',
        body: 'Don\'t forget to capture your daily moment! 📸',
        sound: 'default',
      },
      trigger,
    });

    this.notificationId = notificationId;
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
  }

  async enableNotifications(): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, enabled: true });
  }

  async disableNotifications(): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, enabled: false });
  }

  async testNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      identifier: `test-${Date.now()}`,
      content: {
        title: 'LifeLoop Test',
        body: 'This is a test notification! 📸',
        data: { test: true },
      },
      trigger: null, // Show immediately
    });
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.notificationId = null;
    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
  }

  getNotificationId(): string | null {
    return this.notificationId;
  }
}

export const notificationService = new NotificationService();
