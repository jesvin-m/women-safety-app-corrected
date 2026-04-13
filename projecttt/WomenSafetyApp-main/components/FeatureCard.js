import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../constants/styles';

const FeatureCard = ({
  title,
  description,
  icon,
  onPress,
  isLoading,
  isAlarm,
  isPlaying,
  translateY,
  scale
}) => {
  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateY },
            { scale }
          ]
        }
      ]}
    >
      <Surface
        style={[
          styles.cardSurface,
          isAlarm && isPlaying && styles.alarmCard
        ]}
      >
        <TouchableOpacity
          style={styles.cardInner}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <IconButton
            icon={icon}
            size={32}
            iconColor={isAlarm && isPlaying ? '#f44336' : '#FF4081'}
          />
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          {isAlarm && (
            <Surface style={styles.alarmStatus}>
              <Surface style={[styles.alarmIndicator, isPlaying && styles.alarmActive]} />
              <Text style={styles.alarmStatusText}>
                {isPlaying ? 'Alarm Active' : 'Alarm Inactive'}
              </Text>
            </Surface>
          )}
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );
};

export default FeatureCard;