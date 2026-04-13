import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalConditions: '',
    address: '',
    allergies: '',
  });

  useEffect(() => {
    loadProfile();
    // Remove the cleanup function that was automatically saving
    return () => {};  // Empty cleanup function
  }, []);

  const saveProfile = async () => {
    try {
      // Validate required fields
      if (!profile.name || profile.name.trim() === '') {
        Alert.alert('Error', 'Please enter your name');
        return;
      }

      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      Alert.alert('Success', 'Profile saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not save profile');
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Could not load profile');
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      [field]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <TextInput
          label="Full Name *"
          value={profile.name}
          onChangeText={(text) => handleInputChange('name', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Age"
          value={profile.age}
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('age', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Blood Group"
          value={profile.bloodGroup}
          onChangeText={(text) => handleInputChange('bloodGroup', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Emergency Contact *"
          value={profile.emergencyContact}
          keyboardType="phone-pad"
          onChangeText={(text) => handleInputChange('emergencyContact', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Address"
          value={profile.address}
          multiline
          numberOfLines={3}
          onChangeText={(text) => handleInputChange('address', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Medical Conditions"
          value={profile.medicalConditions}
          multiline
          numberOfLines={2}
          onChangeText={(text) => handleInputChange('medicalConditions', text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Allergies"
          value={profile.allergies}
          multiline
          onChangeText={(text) => handleInputChange('allergies', text)}
          style={styles.input}
          mode="outlined"
        />
        <Button 
          mode="contained" 
          onPress={saveProfile}
          style={styles.button}
        >
          Save Profile
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  surface: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#FF4081',
  },
});

export default EditProfileScreen;