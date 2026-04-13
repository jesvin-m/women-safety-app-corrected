import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import { Audio } from 'expo-av';
import { Clipboard } from 'react-native';
import * as SMS from 'expo-sms';

// Copy all the HomeScreen component code here
const HomeScreen = ({ navigation }) => {
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [location, setLocation] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [isFakeCalling, setIsFakeCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    medicalInfo: '',
    emergencyInfo: ''
  });

  // Copy all functions and JSX from App.js HomeScreen component
  const manageTrustedContacts = () => {
    navigation.navigate('TrustedContacts');
  };
  
  // Update shareLocation function to use SMS
  const shareLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const message = `Emergency! I need help! Here's my current location:\nhttps://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      
      if (trustedContacts.length > 0) {
        const phoneNumbers = trustedContacts.map(contact => contact.phoneNumbers[0]?.number).filter(Boolean);
        
        if (phoneNumbers.length > 0) {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            await SMS.sendSMSAsync(phoneNumbers, message);
            Alert.alert('Success', 'Location sent to trusted contacts');
          } else {
            Alert.alert('Error', 'SMS service is not available');
          }
        } else {
          Alert.alert('Error', 'No valid phone numbers found in trusted contacts');
        }
      } else {
        Alert.alert('No Trusted Contacts', 'Please add trusted contacts first');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not access location');
    }
  };
};

const styles = StyleSheet.create({
  // Copy all styles from App.js
  // ... styles ...
});

export default HomeScreen;