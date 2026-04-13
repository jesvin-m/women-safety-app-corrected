import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { sendLocationToContacts } from '../utils/locationUtils';

export const useScreamDetection = (trustedContacts, navigation) => {
  const [isListening, setIsListening] = useState(false);
  const [isScreaming, setIsScreaming] = useState(false);
  const [contacts, setContacts] = useState([]);
  const recording = useRef(null);

  // Initialize trusted contacts
  useEffect(() => {
    if (trustedContacts && Array.isArray(trustedContacts)) {
      setContacts(trustedContacts);
    }
  }, [trustedContacts]);

  // Scream-specific parameters
  const SCREAM_THRESHOLD = -25; // Lower threshold for better scream detection (in dB)
  const DURATION_THRESHOLD = 500; // Longer duration for more reliable scream detection (ms)
  const ANALYSIS_INTERVAL = 100; // Analysis interval (ms)
  const COOLDOWN_PERIOD = 10000; // 10 second cooldown after scream detection (ms)
  
  let screamStartTime = null;
  let lastScreamTime = 0;
  
  const startListening = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is required for scream detection');
        return;
      }

      // Initialize Audio first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Create recording with metering enabled
      recording.current = new Audio.Recording();
      await recording.current.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          enableMetering: true,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          enableMetering: true,
        },
      });

      recording.current.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          const currentTime = Date.now();
          // Check if we're in cooldown period
          if (currentTime - lastScreamTime < COOLDOWN_PERIOD) {
            return;
          }

          const isLoud = status.metering < SCREAM_THRESHOLD;
          if (isLoud && !screamStartTime) {
            screamStartTime = currentTime;
          } else if (isLoud && screamStartTime) {
            const duration = currentTime - screamStartTime;
            if (duration >= DURATION_THRESHOLD) {
              handleScreamDetected();
              lastScreamTime = currentTime;
            }
          } else {
            screamStartTime = null;
          }
        }
      });
      
      recording.current.setProgressUpdateInterval(ANALYSIS_INTERVAL);
      setIsListening(true);
      await recording.current.startAsync();
    } catch (error) {
      console.error('Error starting scream detection:', error);
      Alert.alert('Error', 'Failed to start scream detection');
    }
  };

  const stopListening = async () => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }
      setIsListening(false);
      setIsScreaming(false);
    } catch (error) {
      console.error('Error stopping scream detection:', error);
      Alert.alert('Error', 'Failed to stop scream detection');
    }
  };

  const handleScreamDetected = async () => {
    if (!isScreaming) {
      setIsScreaming(true);
      try {
        // Validate trusted contacts first
        if (!contacts || contacts.length === 0) {
          Alert.alert(
            'No Trusted Contacts',
            'Please add trusted contacts before using scream detection',
            [
              { 
                text: 'Add Contacts', 
                onPress: () => {
                  if (navigation) {
                    navigation.navigate('TrustedContacts');
                  } else {
                    console.warn('Navigation not available');
                  }
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }

        // Location checks and permissions
        const locationEnabled = await Location.hasServicesEnabledAsync();
        if (!locationEnabled) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings',
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to send your location to emergency contacts',
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }

        // Get location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 20000,
        });

        // Send emergency message
        const message = `EMERGENCY! Scream detected!\nCurrent Location: https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
        const phoneNumbers = contacts.map(contact => contact.phoneNumbers[0]?.number).filter(Boolean);
        
        if (phoneNumbers.length === 0) {
          throw new Error('No valid phone numbers in trusted contacts');
        }

        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          await SMS.sendSMSAsync(phoneNumbers, message);
          await sendLocationToContacts(contacts, true);
          Alert.alert('Emergency Alert Sent', 'Location has been shared with your trusted contacts');
        } else {
          throw new Error('SMS not available');
        }
      } catch (error) {
        console.error('Error in scream detection handler:', error);
        Alert.alert(
          'Alert Failed',
          'Could not send emergency alert. Please check your contacts and permissions.'
        );
      } finally {
        setIsScreaming(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    isListening,
    isScreaming,
    startListening,
    stopListening
  };
};