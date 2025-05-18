// src/screens/user/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import AppHeader from '../../components/common/AppHeader';

const NotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    allNotifications: true,
    bookingReminders: true,
    bookingConfirmations: true,
    promotions: false,
    appUpdates: true,
  });

  const user = auth().currentUser;

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists && userDoc.data().notificationSettings) {
          setSettings({
            ...settings,
            ...userDoc.data().notificationSettings,
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const updateNotificationSetting = async (key, value) => {
    // Update local state immediately for responsive UI
    setSettings({
      ...settings,
      [key]: value,
      // If turning off all notifications, turn off everything
      ...(key === 'allNotifications' && !value
        ? {
            bookingReminders: false,
            bookingConfirmations: false,
            promotions: false,
            appUpdates: false,
          }
        : {}),
      // If turning on a specific notification, ensure allNotifications is on
      ...(key !== 'allNotifications' && value
        ? { allNotifications: true }
        : {}),
    });

    // Update in Firestore
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          [`notificationSettings.${key}`]: value,
          // Update allNotifications if needed
          ...(key !== 'allNotifications' && value
            ? { 'notificationSettings.allNotifications': true }
            : {}),
          // Update all settings if turning off allNotifications
          ...(key === 'allNotifications' && !value
            ? {
                'notificationSettings.bookingReminders': false,
                'notificationSettings.bookingConfirmations': false,
                'notificationSettings.promotions': false,
                'notificationSettings.appUpdates': false,
              }
            : {}),
        });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
      
      // Revert the local state if the update fails
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: !value,
      }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader 
          title="Notifications" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
        </View>
      </SafeAreaView>
    );
  }

  const notificationItems = [
    {
      id: 'allNotifications',
      title: 'All Notifications',
      description: 'Enable or disable all notifications',
      iconName: 'notifications',
      value: settings.allNotifications,
    },
    {
      id: 'bookingReminders',
      title: 'Booking Reminders',
      description: 'Receive reminders before your booking starts',
      iconName: 'access-time',
      value: settings.bookingReminders,
      disabled: !settings.allNotifications,
    },
    {
      id: 'bookingConfirmations',
      title: 'Booking Confirmations',
      description: 'Receive confirmations for new bookings',
      iconName: 'check-circle',
      value: settings.bookingConfirmations,
      disabled: !settings.allNotifications,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Receive special offers and promotions',
      iconName: 'local-offer',
      value: settings.promotions,
      disabled: !settings.allNotifications,
    },
    {
      id: 'appUpdates',
      title: 'App Updates',
      description: 'Receive updates about new features',
      iconName: 'system-update',
      value: settings.appUpdates,
      disabled: !settings.allNotifications,
    },
  ];

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Icon name={item.iconName} size={24} color="#4A80F0" />
      </View>
      
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>
      
      <Switch
        value={item.value}
        onValueChange={(value) => updateNotificationSetting(item.id, value)}
        disabled={item.disabled}
        trackColor={{ false: '#E0E0E0', true: '#B3CCFF' }}
        thumbColor={item.value ? '#4A80F0' : '#F5F5F5'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Notifications" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <Text style={styles.sectionDescription}>
          Choose which notifications you want to receive
        </Text>
        
        <FlatList
          data={notificationItems}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All Notifications</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#666',
  },
  clearButton: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
});

export default NotificationsScreen;