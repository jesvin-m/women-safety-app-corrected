import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [screamDetectionEnabled, setScreamDetectionEnabled] = useState(true);
  const [gestureDetectionEnabled, setGestureDetectionEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notifications ?? true);
        setLocationEnabled(parsedSettings.location ?? true);
        setScreamDetectionEnabled(parsedSettings.screamDetection ?? true);
        setGestureDetectionEnabled(parsedSettings.gestureDetection ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notifications: notificationsEnabled,
        location: locationEnabled,
        screamDetection: screamDetectionEnabled,
        gestureDetection: gestureDetectionEnabled,
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>History</List.Subheader>
        <List.Item
          title="SOS History"
          description="View date & time of past emergency alerts"
          left={(props) => <List.Icon {...props} icon="history" />}
          onPress={() => navigation.navigate('SosHistory')}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>General Settings</List.Subheader>
        <List.Item
          title="Notifications"
          description="Enable push notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                saveSettings();
              }}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Location Services"
          description="Enable location tracking"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <Switch
              value={locationEnabled}
              onValueChange={(value) => {
                setLocationEnabled(value);
                saveSettings();
              }}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Safety Features</List.Subheader>
        <List.Item
          title="Scream Detection"
          description="Detect emergency situations through voice"
          left={props => <List.Icon {...props} icon="microphone" />}
          right={() => (
            <Switch
              value={screamDetectionEnabled}
              onValueChange={(value) => {
                setScreamDetectionEnabled(value);
                saveSettings();
              }}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Gesture Detection"
          description="Detect emergency gestures"
          left={props => <List.Icon {...props} icon="gesture" />}
          right={() => (
            <Switch
              value={gestureDetectionEnabled}
              onValueChange={(value) => {
                setGestureDetectionEnabled(value);
                saveSettings();
              }}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Divider />
        <List.Item
          title="Manage Trusted Contacts"
          description="Add or remove emergency contacts"
          left={props => <List.Icon {...props} icon="contacts" />}
          onPress={() => navigation.navigate('TrustedContacts')}
        />
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default SettingsScreen;
