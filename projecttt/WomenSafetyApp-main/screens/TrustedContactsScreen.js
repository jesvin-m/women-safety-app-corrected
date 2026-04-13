import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, FAB, TextInput, Divider, Surface, Text, IconButton } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrustedContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initial load is done in the combined effect below.
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });
        if (data.length > 0) {
          const sortedContacts = data
            .filter(contact => contact.name && contact.phoneNumbers)
            .sort((a, b) => a.name.localeCompare(b.name));
          setContacts(sortedContacts);
        }
      } else {
        Alert.alert('Permission Required', 'Please grant contacts permission to use this feature.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
    }
  };

  // Add this function after handleSelectContact
  const saveContacts = async (contacts) => {
    try {
      await AsyncStorage.setItem('trustedContacts', JSON.stringify(contacts));
    } catch (error) {
      Alert.alert('Error', 'Failed to save contacts');
    }
  };
  
  // Modify handleSelectContact
  const handleSelectContact = (contact) => {
    if (selectedContacts.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 trusted contacts');
      return;
    }
    
    if (!selectedContacts.find(c => c.id === contact.id)) {
      const updatedContacts = [...selectedContacts, contact];
      setSelectedContacts(updatedContacts);
      saveContacts(updatedContacts);
      Alert.alert('Success', `${contact.name} added to trusted contacts`);
    }
  };

  // Modify removeContact
  const removeContact = (contactId) => {
    const updatedContacts = selectedContacts.filter(c => c.id !== contactId);
    setSelectedContacts(updatedContacts);
    saveContacts(updatedContacts);
  };
  
  // Add this to useEffect to load saved contacts
  useEffect(() => {
    const loadSavedContacts = async () => {
      try {
        const saved = await AsyncStorage.getItem('trustedContacts');
        if (saved) {
          setSelectedContacts(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved contacts:', error);
      }
    };
    
    loadContacts();
    loadSavedContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.selectedContactsContainer}>
        <Text style={styles.sectionTitle}>Trusted Contacts ({selectedContacts.length}/5)</Text>
        {selectedContacts.map((contact) => (
          <List.Item
            key={`selected-${contact.id}`}
            title={contact.name}
            description={contact.phoneNumbers[0]?.number}
            left={props => <List.Icon {...props} icon="account-check" />}
            right={() => (
              <IconButton
                icon="delete"
                onPress={() => removeContact(contact.id)}
                accessibilityLabel={`Delete ${contact.name}`}
              />
            )}
          />
        ))}
      </Surface>

      <TextInput
        placeholder="Search contacts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <ScrollView style={styles.contactsList}>
        {filteredContacts.map((contact) => (
          <React.Fragment key={contact.id}>
            <List.Item
              title={contact.name}
              description={contact.phoneNumbers[0]?.number}
              left={props => <List.Icon {...props} icon="account" />}
              onPress={() => handleSelectContact(contact)}
            />
            <Divider />
          </React.Fragment>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={loadContacts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  selectedContactsContainer: {
    padding: 10,
    margin: 10,
    elevation: 2,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    margin: 10,
    backgroundColor: 'white',
  },
  contactsList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF4081',
  },
});

export default TrustedContactsScreen;