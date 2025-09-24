import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
} from 'react-native';
import { AddIcon, CarIcon, GasPumpIcon, CheckIcon } from './Icons';

interface FloatingActionButtonProps {
  onStartJourneyPress: () => void;
  onAddRefuelPress: () => void;
  onFinishJourneyPress: () => void;
  isJourneyStarted: boolean;
}

export default function FloatingActionButton({
  onStartJourneyPress,
  onAddRefuelPress,
  onFinishJourneyPress,
  isJourneyStarted,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const buttonRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const startJourneyTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const refuelTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isJourneyStarted ? -70 : -140],
  });

  const finishJourneyTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const actionOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Start Journey Button (visible only when not started) */}
      {!isJourneyStarted && (
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: startJourneyTranslate }],
              opacity: actionOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => {
              toggleExpand();
              onStartJourneyPress();
            }}
            activeOpacity={0.8}
          >
            <CarIcon size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionText}>Start Journey</Text>
        </Animated.View>
      )}

      {/* Add Refuel Button */}
      <Animated.View
        style={[
          styles.actionButton,
          {
            transform: [{ translateY: refuelTranslate }],
            opacity: actionOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => {
            toggleExpand();
            onAddRefuelPress();
          }}
          activeOpacity={0.8}
        >
          <GasPumpIcon size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.actionText}>Add Refuel</Text>
      </Animated.View>

      {/* Finish Journey Button (visible only when started) */}
      {isJourneyStarted && (
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: finishJourneyTranslate }],
              opacity: actionOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => {
              toggleExpand();
              onFinishJourneyPress();
            }}
            activeOpacity={0.8}
          >
            <CheckIcon size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionText}>Finish Journey</Text>
        </Animated.View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          {
            backgroundColor: isJourneyStarted ? '#27ae60' : '#000',
          },
        ]}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: buttonRotate }] }}>
          <AddIcon size={30} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    alignItems: 'center',
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  actionButton: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    right: 15,
  },
  smallButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  actionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 15,
  },
});
