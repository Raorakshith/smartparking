// src/screens/admin/SystemSettings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Switch,
  Divider,
  List,
  ActivityIndicator,
  IconButton,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebaseFirestore } from '../../config/firebase';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Campus Parking App',
    operatingHours: {
      opening: '06:00',
      closing: '22:00',
    },
    defaultHourlyRate: 2.5,
    maxBookingDays: 14,
    cancelationPeriod: 6, // hours before booking start
    notificationsEnabled: true,
    maintenanceMode: false,
    maxBookingsPerUser: 3,
    allowMultipleDayBookings: true,
  });
  
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [maintenanceModeDialogVisible, setMaintenanceModeDialogVisible] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch system settings from Firestore
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsDoc = await firebaseFirestore.collection('system').doc('settings').get();
      
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        setSettings(data);
      } else {
        // If settings don't exist yet, create them with default values
        await saveSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', 'Failed to load system settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to Firestore
  const saveSettings = async (settingsData) => {
    setSaving(true);
    try {
      await firebaseFirestore.collection('system').doc('settings').set(
        settingsData,
        { merge: true }
      );
      
      Alert.alert('Success', 'Settings saved successfully.');
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle text input changes
  const handleTextChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  // Handle nested object changes
  const handleNestedChange = (parent, field, value) => {
    setSettings({
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value,
      },
    });
  };

  // Handle switch changes
  const handleSwitchChange = (field, value) => {
    // Special handling for maintenance mode
    if (field === 'maintenanceMode' && value === true) {
      setMaintenanceModeDialogVisible(true);
      return;
    }
    
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  // Handle maintenance mode confirmation
  const confirmMaintenanceMode = () => {
    setSettings({
      ...settings,
      maintenanceMode: true,
    });
    setMaintenanceModeDialogVisible(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate settings before saving
    if (!validateSettings()) {
      return;
    }
    
    await saveSettings(settings);
  };

  // Validate settings
  const validateSettings = () => {
    // Check if operating hours are valid
    const openingTime = settings.operatingHours.opening;
    const closingTime = settings.operatingHours.closing;
    
    if (!isValidTimeFormat(openingTime) || !isValidTimeFormat(closingTime)) {
      Alert.alert('Invalid Time Format', 'Please enter times in the format HH:MM');
      return false;
    }
    
    // Check if hourly rate is valid
    if (isNaN(settings.defaultHourlyRate) || settings.defaultHourlyRate <= 0) {
      Alert.alert('Invalid Hourly Rate', 'Hourly rate must be a positive number');
      return false;
    }
    
    // Check if max booking days is valid
    if (isNaN(settings.maxBookingDays) || settings.maxBookingDays <= 0) {
      Alert.alert('Invalid Max Booking Days', 'Maximum booking days must be a positive number');
      return false;
    }
    
    // Check if cancelation period is valid
    if (isNaN(settings.cancelationPeriod) || settings.cancelationPeriod < 0) {
      Alert.alert('Invalid Cancelation Period', 'Cancelation period must be a non-negative number');
      return false;
    }
    
    // Check if max bookings per user is valid
    if (isNaN(settings.maxBookingsPerUser) || settings.maxBookingsPerUser <= 0) {
      Alert.alert('Invalid Max Bookings', 'Maximum bookings per user must be a positive number');
      return false;
    }
    
    return true;
  };

  // Helper to check time format
  const isValidTimeFormat = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // Reset to default settings
  const resetToDefaults = () => {
    setResetDialogVisible(true);
  };

  // Confirm reset to defaults
  const confirmReset = async () => {
    const defaultSettings = {
      systemName: 'Campus Parking App',
      operatingHours: {
        opening: '06:00',
        closing: '22:00',
      },
      defaultHourlyRate: 2.5,
      maxBookingDays: 14,
      cancelationPeriod: 6,
      notificationsEnabled: true,
      maintenanceMode: false,
      maxBookingsPerUser: 3,
      allowMultipleDayBookings: true,
    };
    
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
    setResetDialogVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.title}>System Settings</Title>
            <Text style={styles.subtitle}>Configure application parameters</Text>
          </Card.Content>
        </Card>

        {/* General Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title>General Settings</Title>
            
            <TextInput
              label="System Name"
              value={settings.systemName}
              onChangeText={(text) => handleTextChange('systemName', text)}
              style={styles.input}
            />
            
            <View style={styles.switchContainer}>
               <Text style={styles.switchLabel}>Enable Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleSwitchChange('notificationsEnabled', value)}
                color="#4285F4"
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Maintenance Mode</Text>
              <Switch
                value={settings.maintenanceMode}
                onValueChange={(value) => handleSwitchChange('maintenanceMode', value)}
                color="#EA4335"
              />
            </View>
            
            <Text style={styles.helperText}>
              Enabling maintenance mode will prevent users from making new bookings.
            </Text>
          </Card.Content>
        </Card>

        {/* Booking Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title>Booking Settings</Title>
            
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Operating Hours:</Text>
              <View style={styles.timeInputs}>
                <TextInput
                  label="Opening Time"
                  value={settings.operatingHours.opening}
                  onChangeText={(text) => handleNestedChange('operatingHours', 'opening', text)}
                  style={[styles.input, styles.timeInput]}
                  placeholder="HH:MM"
                />
                <Text style={styles.timeToText}>to</Text>
                <TextInput
                  label="Closing Time"
                  value={settings.operatingHours.closing}
                  onChangeText={(text) => handleNestedChange('operatingHours', 'closing', text)}
                  style={[styles.input, styles.timeInput]}
                  placeholder="HH:MM"
                />
              </View>
            </View>
            
            <TextInput
              label="Default Hourly Rate ($)"
              value={settings.defaultHourlyRate.toString()}
              onChangeText={(text) => handleTextChange('defaultHourlyRate', parseFloat(text) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Maximum Booking Days in Advance"
              value={settings.maxBookingDays.toString()}
              onChangeText={(text) => handleTextChange('maxBookingDays', parseInt(text) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Cancellation Period (hours before booking)"
              value={settings.cancelationPeriod.toString()}
              onChangeText={(text) => handleTextChange('cancelationPeriod', parseInt(text) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Maximum Active Bookings per User"
              value={settings.maxBookingsPerUser.toString()}
              onChangeText={(text) => handleTextChange('maxBookingsPerUser', parseInt(text) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Allow Multiple-Day Bookings</Text>
              <Switch
                value={settings.allowMultipleDayBookings}
                onValueChange={(value) => handleSwitchChange('allowMultipleDayBookings', value)}
                color="#4285F4"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.saveButton}
            loading={saving}
            disabled={saving}
          >
            Save Settings
          </Button>
          
          <Button
            mode="outlined"
            onPress={resetToDefaults}
            style={styles.resetButton}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
        </View>

        {/* System Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <List.Accordion
              title="System Information"
              left={props => <List.Icon {...props} icon="information" />}
            >
              <List.Item 
                title="Version" 
                description="1.0.0" 
                left={props => <List.Icon {...props} icon="tag" />} 
              />
              <List.Item 
                title="Database" 
                description="Firebase Firestore" 
                left={props => <List.Icon {...props} icon="database" />} 
              />
              <List.Item 
                title="Authentication" 
                description="Firebase Authentication" 
                left={props => <List.Icon {...props} icon="shield-account" />} 
              />
              <List.Item 
                title="Storage" 
                description="Firebase Storage" 
                left={props => <List.Icon {...props} icon="folder" />} 
              />
              <List.Item 
                title="Environment" 
                description="Production" 
                left={props => <List.Icon {...props} icon="web" />} 
              />
            </List.Accordion>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      <Portal>
        <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
          <Dialog.Title>Reset Settings</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmReset} color="#EA4335">Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Maintenance Mode Dialog */}
      <Portal>
        <Dialog visible={maintenanceModeDialogVisible} onDismiss={() => setMaintenanceModeDialogVisible(false)}>
          <Dialog.Title>Enable Maintenance Mode</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Enabling maintenance mode will prevent users from making new bookings. All users will be notified that the system is under maintenance.
            </Paragraph>
            <Paragraph style={styles.warningText}>
              Are you sure you want to enable maintenance mode?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMaintenanceModeDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmMaintenanceMode} color="#EA4335">Enable</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4285F4',
  },
  headerCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    color: '#666',
  },
  settingsCard: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeToText: {
    marginHorizontal: 8,
    color: '#666',
  },
  actionButtons: {
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 8,
    backgroundColor: '#4285F4',
  },
  resetButton: {
    borderColor: '#EA4335',
  },
  infoCard: {
    marginBottom: 16,
  },
  warningText: {
    color: '#EA4335',
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default SystemSettings;