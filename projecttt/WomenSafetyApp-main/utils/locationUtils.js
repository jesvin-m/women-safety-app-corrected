import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { getServerBaseUrl } from './serverConfig';

const SERVER_URL = getServerBaseUrl();

// Socket configuration with better error handling and connection options
const socket = SERVER_URL
  ? io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    })
  : null;

// Add connection status tracking
let isConnected = false;

if (socket) {
  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    isConnected = true;
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    isConnected = false;
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
  });

  socket.on('alert_sent', (response) => {
    Alert.alert('Success', response.message);
  });

  socket.on('alert_error', (error) => {
    Alert.alert('Error', error.message);
  });
}

let locationUpdateInterval = null;
let emergencyPhoneNumbers = null;
let locationWatchSubscription = null;

async function ensureLocationPermission() {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    Alert.alert('Location Disabled', 'Please enable Location Services and try again.');
    return false;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Location permission is required to share live location.');
    return false;
  }
  return true;
}

async function ensureSocketConnected(timeoutMs = 8000) {
  if (!socket) return false;
  if (socket.connected) return true;

  const start = Date.now();
  return await new Promise((resolve) => {
    const onConnect = () => cleanup(true);
    const onError = () => cleanup(false);

    const timer = setInterval(() => {
      if (Date.now() - start >= timeoutMs) cleanup(false);
    }, 250);

    const cleanup = (result) => {
      clearInterval(timer);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      resolve(result);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onError);
    socket.connect();
  });
}

const startLocationUpdates = async (socket, phoneNumbers) => {
  try {
    // Clear any existing interval first
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }
    if (locationWatchSubscription) {
      locationWatchSubscription.remove();
      locationWatchSubscription = null;
    }
    
    emergencyPhoneNumbers = phoneNumbers;

    const ok = await ensureLocationPermission();
    if (!ok) return null;

    locationWatchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 15,
      },
      (location) => {
        try {
          if (!emergencyPhoneNumbers) return;
          if (!socket?.connected) return;

          socket.emit('location_update', {
            phoneNumbers: emergencyPhoneNumbers,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error sending watched location update:', error);
        }
      }
    );

    console.log('Live location watch started');
    return locationWatchSubscription;
  } catch (error) {
    console.error('Error starting location updates:', error);
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }
    if (locationWatchSubscription) {
      locationWatchSubscription.remove();
      locationWatchSubscription = null;
    }
    throw error;
  }
};

export const stopLocationSharing = () => {
  console.log('Attempting to stop location sharing...');
  try {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
      emergencyPhoneNumbers = null;
      socket?.emit('stop_emergency');
      console.log('Location sharing stopped successfully');
    } else {
      console.log('No active location sharing to stop');
    }
    if (locationWatchSubscription) {
      locationWatchSubscription.remove();
      locationWatchSubscription = null;
    }
    emergencyPhoneNumbers = null;
  } catch (error) {
    console.error('Error stopping location sharing:', error);
    // Ensure cleanup even if there's an error
    locationUpdateInterval = null;
    if (locationWatchSubscription) {
      locationWatchSubscription.remove();
      locationWatchSubscription = null;
    }
    emergencyPhoneNumbers = null;
  }
};

export const sendLocationToContacts = async () => {
  try {
    const permOk = await ensureLocationPermission();
    if (!permOk) return;

    const connected = await ensureSocketConnected();
    if (!connected) {
      Alert.alert(
        'Connection Error',
        `Unable to reach emergency server at ${SERVER_URL || '(not configured)'}. Set EXPO_PUBLIC_SERVER_URL to your deployed HTTPS URL (see DEPLOY.md).`
      );
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    const savedContacts = await AsyncStorage.getItem('trustedContacts');
    if (!savedContacts) {
      Alert.alert('Error', 'No trusted contacts found. Please add contacts first.');
      return;
    }

    const contacts = JSON.parse(savedContacts);
    const phoneNumbers = contacts.map(contact => contact.phoneNumbers[0]?.number).filter(Boolean);

    if (phoneNumbers.length === 0) {
      Alert.alert('Error', 'No valid phone numbers found in trusted contacts');
      return;
    }

    const message = `EMERGENCY ALERT! I need help! My current location:\nhttps://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}\n\nLive location updates will follow.`;

    socket?.emit('emergency_alert', {
      phoneNumbers,
      message,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    });

    // Start sending location updates with phone numbers
    await startLocationUpdates(socket, phoneNumbers);

    console.log('Emergency alert sent to server');
  } catch (error) {
    console.error('Error sending location:', error);
    Alert.alert('Error', 'Failed to send location. Please try again.');
  }
};

export const shareLocation = async (location) => {
  try {
    const permOk = await ensureLocationPermission();
    if (!permOk) return;

    const connected = await ensureSocketConnected();
    if (!connected) {
      Alert.alert(
        'Connection Error',
        `Unable to reach emergency server at ${SERVER_URL || '(not configured)'}. Set EXPO_PUBLIC_SERVER_URL to your deployed HTTPS URL (see DEPLOY.md).`
      );
      return;
    }

    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
    }
    
    const savedContacts = await AsyncStorage.getItem('trustedContacts');
    if (!savedContacts) {
      Alert.alert('Error', 'No trusted contacts found. Please add contacts first.');
      return;
    }

    const contacts = JSON.parse(savedContacts);
    const phoneNumbers = contacts.map(contact => contact.phoneNumbers[0]?.number).filter(Boolean);

    if (phoneNumbers.length === 0) {
      Alert.alert('Error', 'No phone numbers found in trusted contacts');
      return;
    }

    const message = `Emergency! I need help! Here's my current location:\nhttps://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;

    socket?.emit('emergency_alert', {
      phoneNumbers,
      message,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    });
  } catch (error) {
    console.error('Error sharing location:', error);
    Alert.alert('Error', 'Could not share location');
  }
};

export const openSafeRoutes = async (location) => {
  try {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${location.coords.latitude},${location.coords.longitude}`;
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error opening safe routes:', error);
    Alert.alert('Error', 'Could not access safe routes. Please check your location settings.');
  }
};

// Remove the duplicate stopLocationSharing function and its comment