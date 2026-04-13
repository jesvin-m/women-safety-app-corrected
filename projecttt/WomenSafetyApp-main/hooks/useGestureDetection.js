import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { sendLocationToContacts, stopLocationSharing } from '../utils/locationUtils';
import { Alert } from 'react-native';

export const useGestureDetection = (onDoubleShake) => {
  const [isGestureDetectionEnabled, setIsGestureDetectionEnabled] = useState(true);
  const [shakeCount, setShakeCount] = useState(0);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const lastGestureTime = useRef(0);
  const lastAcceleration = useRef(0);
  const shakeTimeoutRef = useRef(null);
  const isEmergencyActive = useRef(false);

  // Adjusted thresholds for less sensitive detection
  const ACCELERATION_THRESHOLD = 2.0; // Increased threshold for more intentional shakes
  const ACCELERATION_CHANGE_THRESHOLD = 1.5; // Increased change threshold
  const GESTURE_COOLDOWN = 200; // Increased cooldown to prevent rapid triggers
  const DOUBLE_SHAKE_WINDOW = 1200; // Increased window for double shake
  const NOISE_THRESHOLD = 0.5; // Increased noise threshold

  useEffect(() => {
    let accelSubscription;

    if (isGestureDetectionEnabled) {
      // Set update interval for accelerometer
      Accelerometer.setUpdateInterval(100); // Reduced update frequency

      // Accelerometer subscription
      accelSubscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const currentAcceleration = Math.sqrt(x * x + y * y + z * z);

        const accelerationDiff = Math.abs(currentAcceleration - lastAcceleration.current);
        lastAcceleration.current = currentAcceleration;


        // Check if acceleration change is significant
        if (accelerationDiff > ACCELERATION_CHANGE_THRESHOLD &&
          currentAcceleration > ACCELERATION_THRESHOLD) {
          console.log('Significant acceleration detected!');
          const currentTime = Date.now();
          if (currentTime - lastGestureTime.current > GESTURE_COOLDOWN) {
            lastGestureTime.current = currentTime;
            handleShakeDetected();
          }
        }
      });
    }

    return () => {
      if (accelSubscription) {
        accelSubscription.remove();
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [isGestureDetectionEnabled]);

  const handleShakeDetected = () => {
    console.log('Shake detected, current count:', shakeCount);

    // Clear any existing timeout
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }

    // Increment shake count
    setShakeCount(prevCount => {
      const newCount = prevCount + 1;
      console.log('New shake count:', newCount);

      // Set timeout to reset shake count if second shake doesn't happen
      shakeTimeoutRef.current = setTimeout(() => {
        console.log('Shake timeout - resetting count');
        setShakeCount(0);
      }, DOUBLE_SHAKE_WINDOW);

      // If this is the second shake, handle double shake
      if (newCount === 2 && !isSendingLocation) {
        console.log('Double shake detected!');
        handleDoubleShake();
      }

      return newCount;
    });
  };

  const handleDoubleShake = async () => {
    console.log('Handling double shake');
    if (isEmergencyActive.current) {
      // Stop emergency if already active
      try {
        await stopLocationSharing();
        isEmergencyActive.current = false;
        Alert.alert('Emergency Stopped', 'Location sharing has been stopped.');
      } catch (error) {
        console.error('Error stopping emergency:', error);
        Alert.alert('Error', 'Failed to stop emergency mode.');
      }
    } else {
      // Start emergency
      setIsSendingLocation(true);
      try {
        if (onDoubleShake) {
          console.log('Calling onDoubleShake callback');
          onDoubleShake();
        }
        await sendLocationToContacts();
        isEmergencyActive.current = true;
        Alert.alert('Emergency Activated', 'Location sharing has been started with your trusted contacts.');
      } catch (error) {
        console.error('Error sending location on double shake:', error);
        Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
      } finally {
        setIsSendingLocation(false);
        setShakeCount(0);
      }
    }
  };

  return {
    isGestureDetectionEnabled,
    setIsGestureDetectionEnabled,
    shakeCount,
    isSendingLocation,
  };
}; 