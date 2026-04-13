import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ResourcesScreen = () => {
  const theme = useTheme();

  const resources = [
    {
      title: 'Safety Tips',
      icon: 'shield-check',
      content: `1. Share your location with trusted contacts
2. Keep emergency numbers handy
3. Stay aware of your surroundings
4. Use well-lit and populated routes
5. Keep your phone charged
6. Learn basic self-defense techniques
7. Trust your instincts
8. Walk confidently and stay alert
9. Keep emergency apps ready
10. Join self-defense classes
11. Have a code word with family/friends
12. Keep your keys ready before reaching home
13. Avoid walking with headphones
14. Share your travel plans
15. Keep emergency cash hidden
16. Learn basic first aid
17. Know your neighborhood safe spots
18. Use ride-sharing safety features
19. Keep important documents digital
20. Practice situational awareness`
    },
    {
      title: 'Emergency Contacts',
      icon: 'phone-alert',
      content: `Police: 100
Ambulance: 102
Women Helpline: 1091
Child Helpline: 1098
Fire: 101
Anti-Stalking: 1091
Cyber Crime: 1930
Railway Police: 182
Tourist Police: 1363
Missing Children: 1098

International Emergency Numbers:
US: 911
UK: 999
Australia: 000
Canada: 911
Europe: 112`
    },
    {
      title: 'Self-Defense Guide',
      icon: 'karate',
      content: `1. Basic Stance
• Feet shoulder-width apart
• Hands up protecting face
• Weight slightly forward

2. Vulnerable Points
• Eyes: Thumb jab
• Throat: Palm strike
• Groin: Knee strike
• Knees: Side kick

3. Break Free Techniques
• Wrist grab: Twist and pull
• Bear hug: Elbow strike
• Hair grab: Hand lock
• Choke hold: Chin tuck

4. Using Everyday Objects
• Keys: Hold between fingers
• Pen: Stab with cap end
• Bag: Swing as weapon
• Umbrella: Use as staff

5. Verbal Self-Defense
• Use strong, clear voice
• Say "NO" firmly
• Call for help loudly
• Use "STOP" command`
    },
    {
      title: 'Legal Rights',
      icon: 'scale-balance',
      content: `1. Right to Self-Defense
• Section 96-106 of IPC
• Right to protect yourself
• Reasonable force allowed

2. Sexual Harassment Laws
• POSH Act 2013
• Section 354A IPC
• Zero tolerance policy

3. Cyber Crime Laws
• IT Act 2000
• Section 66A
• Cyber stalking laws

4. Domestic Violence Act
• Protection of Women
• Right to shelter
• Emergency protection

5. Important Documents
• Keep digital copies
• Emergency contacts
• Medical records
• Legal documents`
    },
    {
      title: 'Mental Health',
      icon: 'heart-pulse',
      content: `1. Coping Strategies
• Deep breathing
• Grounding techniques
• Positive self-talk
• Mindfulness

2. Support Resources
• Therapy services
• Support groups
• Crisis helplines
• Online counseling

3. Self-Care Tips
• Regular exercise
• Healthy sleep
• Balanced diet
• Stress management

4. Emergency Support
• Crisis hotlines
• Emergency services
• Trusted friends
• Professional help`
    },
    {
      title: 'Technology Safety',
      icon: 'cellphone-shield',
      content: `1. Phone Security
• Enable location sharing
• Set up emergency contacts
• Use safety apps
• Regular backups

2. Social Media Safety
• Privacy settings
• Location sharing off
• Limited personal info
• Regular security checks

3. Online Safety
• Strong passwords
• Two-factor auth
• Secure connections
• Regular updates

4. Emergency Apps
• SOS features
• Location tracking
• Emergency alerts
• Quick dialing`
    },
    {
      title: 'Travel Safety',
      icon: 'map-marker-path',
      content: `1. Before Travel
• Share itinerary
• Research destination
• Emergency contacts
• Travel insurance

2. During Travel
• Stay in public areas
• Keep valuables hidden
• Stay connected
• Trust instincts

3. Accommodation
• Safe neighborhoods
• Secure locks
• Emergency exits
• Room security

4. Transportation
• Licensed services
• Share ride details
• Seat belt use
• Emergency exits`
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {resources.map((resource, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <MaterialCommunityIcons 
                name={resource.icon} 
                size={24} 
                color={theme.colors.primary} 
                style={styles.icon}
              />
              <Title style={styles.title}>{resource.title}</Title>
            </View>
            <Paragraph style={styles.content}>{resource.content}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    color: '#333',
  },
  content: {
    fontSize: 14,
    lineHeight: 24,
    color: '#666',
  },
});

export default ResourcesScreen; 