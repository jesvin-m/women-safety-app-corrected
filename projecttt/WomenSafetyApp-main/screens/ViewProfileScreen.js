import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Surface, Text, Button, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalConditions: '',
    address: '',
    allergies: '',
  });

  // Add focus effect to reload profile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });

    return unsubscribe;
  }, [navigation]);

  // Keep existing useEffect
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const renderField = (label, value) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not set'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Title style={styles.title}>Profile Information</Title>
        {renderField('Name', profile.name)}
        {renderField('Age', profile.age)}
        {renderField('Blood Group', profile.bloodGroup)}
        {renderField('Emergency Contact', profile.emergencyContact)}
        {renderField('Address', profile.address)}
        {renderField('Medical Conditions', profile.medicalConditions)}
        {renderField('Allergies', profile.allergies)}
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.button}
        >
          Edit Profile
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
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#FF4081',
  },
});

export default ViewProfileScreen;