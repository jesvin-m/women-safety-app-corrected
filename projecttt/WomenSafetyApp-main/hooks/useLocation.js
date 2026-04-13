import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    let locationSubscription;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        
        if (status === 'granted') {
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(initialLocation);

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (newLocation) => {
              setLocation(newLocation);
            }
          );
        }
      } catch (error) {
        console.error('Error setting up location:', error);
      }
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not access location');
      return null;
    } finally {
      setIsLocationLoading(false);
    }
  };

  return {
    location,
    locationPermission,
    isLocationLoading,
    getCurrentLocation,
  };
}; 