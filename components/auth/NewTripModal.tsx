import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

interface NewTripModalProps {
  visible: boolean;
  onClose: () => void;
  onStartTrip: (tripData: {
    beginningKilometers: string;
    origin: string;
    destination: string;
  }) => void;
}

export default function NewTripModal({
  visible,
  onClose,
  onStartTrip,
}: NewTripModalProps) {
  const [beginningKilometers, setBeginningKilometers] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = async () => {
    if (!beginningKilometers || !origin || !destination) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Placeholder API call to start trip
      await api.post('/trips', {
        beginning_kilometers: beginningKilometers,
        origin,
        destination,
      });
      onStartTrip({ beginningKilometers, origin, destination });
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Failed to start trip. Please try again.'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.fullScreenModalContainer, styles.modalOuterPadding]}>
        <View style={styles.modalContent}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="black" />
          </Pressable>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.centerContent}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Start a new trip</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputModal}
                  placeholder="Beginning Kilometers (0)"
                  value={beginningKilometers}
                  onChangeText={setBeginningKilometers}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.inputModal}
                  placeholder="Origin (Select Origin)"
                  value={origin}
                  onChangeText={setOrigin}
                />
                <TextInput
                  style={styles.inputModal}
                  placeholder="Destination (Select Destination)"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
              <View style={styles.submitButtonContainer}>
                <TouchableOpacity
                  style={[styles.submitButton, styles.buttonStartTrip]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Start Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 24,
  },
  modalContent: {
    flex: 1,
    paddingVertical: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 6,
    padding: 2,
    zIndex: 1,
  },
  centerContent: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  modalTitleContainer: {
    width: '80%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'left',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  inputModal: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
  },
  submitButtonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'flex-end',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonStartTrip: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOuterPadding: {
    paddingHorizontal: 12,
  },
});
