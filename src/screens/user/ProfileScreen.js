// src/screens/user/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        
        if (currentUser) {
          const userDoc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();
          
          if (userDoc.exists) {
            setUser({
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              ...userDoc.data(),
            });
            
            // Set notifications toggle based on user preferences
            if (userDoc.data().notificationsEnabled !== undefined) {
              setNotificationsEnabled(userDoc.data().notificationsEnabled);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Logout',
          onPress: async () => {
            try {
              await auth().signOut();
              // Navigation will be handled by App.js
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    
    // In a real app, you would update user preferences in Firestore
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          notificationsEnabled: value,
        });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert UI state if update fails
      setNotificationsEnabled(!value);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Profile" />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {user?.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user?.email.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Account Settings</Text>
        </View>
        
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="person" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Personal Information</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsRow}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.settingsIconContainer}>
              <Icon name="notifications" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#E0E0E0', true: '#B3CCFF' }}
              thumbColor={notificationsEnabled ? '#4A80F0' : '#F5F5F5'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="credit-card" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Payment Methods</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="security" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Security</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Support</Text>
        </View>
        
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="help-outline" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Help Center</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="info-outline" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>About App</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Icon name="privacy-tip" size={24} color="#4A80F0" />
            </View>
            <Text style={styles.settingsText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
    padding: 16,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4A80F0',
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    color: '#4A80F0',
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    marginTop: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
});

export default ProfileScreen;