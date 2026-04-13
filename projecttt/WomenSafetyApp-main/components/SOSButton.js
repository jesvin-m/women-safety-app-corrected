import React from 'react';
import { FAB } from 'react-native-paper';
import { Animated } from 'react-native';
import { styles } from '../constants/styles';

const SOSButton = ({ isPanicMode, onPress, sosScale, sosRotation }) => {
  return (
    <Animated.View
      style={[
        styles.sosContainer,
        {
          transform: [
            { scale: sosScale },
            { rotate: sosRotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })},
          ],
        },
      ]}
    >
      <FAB
        style={[styles.sos, isPanicMode && styles.sosActive]}
        large
        icon={isPanicMode ? "alert" : "alert-outline"}
        label={isPanicMode ? "CANCEL ALERT" : "SOS"}
        onPress={onPress}
      />
    </Animated.View>
  );
};

export default SOSButton; 