import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sendLocationToWhatsApp = async (location, contacts) => {
  try {
    const message = `Emergency! I need help! Here's my current location:\nhttps://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    
    for (const contact of contacts) {
      const phoneNumber = contact.phoneNumbers[0]?.number;
      if (phoneNumber) {
        // Format phone number to include country code if not present
        const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`;
        
        // Check if WhatsApp is installed
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          // If WhatsApp is not installed, try opening in browser
          const webWhatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
          await Linking.openURL(webWhatsappUrl);
        }
      }
    }

    Alert.alert('Success', 'Location sent to trusted contacts via WhatsApp');
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    Alert.alert('Error', 'Failed to send location via WhatsApp');
  }
}; 