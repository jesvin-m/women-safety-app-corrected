import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudio = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio on component mount
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    initAudio();

    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAlarm = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require('../assets/alarm.mp3'));
      await soundObject.setIsLoopingAsync(true);
      await soundObject.setVolumeAsync(1.0);
      await soundObject.playAsync();

      setSound(soundObject);
      setIsPlaying(true);
      console.log('Alarm started successfully');
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Failed to play alarm sound');
      setIsPlaying(false);
    }
  };

  const stopAlarm = async () => {
    try {
      console.log('Stopping alarm');
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        console.log('Alarm stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping alarm:', error);
      Alert.alert(
        'Error',
        'Could not stop alarm. Please try again.',
        [{ text: 'OK' }]
      );
      // Reset states even if there's an error
      setIsPlaying(false);
      setSound(null);
    }
  };

  return {
    sound,
    isPlaying,
    playAlarm,
    stopAlarm,
  };
};