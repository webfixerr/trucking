import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useTripStore } from '@/stores/tripStore';

interface StartTripModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StartTripModal({
  visible,
  onClose,
}: StartTripModalProps) {
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [beginningDistance, setBeginningDistance] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const { addTrip } = useTripStore();

  const handleStartTrip = async () => {
    if (!beginningDistance || !origin || !destination) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      await addTrip({
        origin,
        destination,
        beginning_kilometers: beginningDistance,
        distance_unit: distanceUnit,
      });
      setBeginningDistance('');
      setOrigin('');
      setDestination('');
      onClose();
    } catch (error: any) {
      setError('Failed to start trip. Data saved for syncing.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Start New Trip</Text>

          {/* Distance Unit Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Distance Unit:</Text>
            <View style={styles.toggleSwitch}>
              <Text
                style={[
                  styles.toggleText,
                  distanceUnit === 'km' && styles.toggleTextActive,
                ]}
              >
                Kilometers
              </Text>
              <Switch
                value={distanceUnit === 'miles'}
                onValueChange={(value) =>
                  setDistanceUnit(value ? 'miles' : 'km')
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={distanceUnit === 'miles' ? '#f5dd4b' : '#f4f3f4'}
              />
              <Text
                style={[
                  styles.toggleText,
                  distanceUnit === 'miles' && styles.toggleTextActive,
                ]}
              >
                Miles
              </Text>
            </View>
          </View>

          {/* Beginning Distance Input */}
          <Text style={styles.inputLabel}>
            Beginning {distanceUnit === 'km' ? 'Kilometers' : 'Miles'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter distance in ${distanceUnit}`}
            keyboardType="numeric"
            value={beginningDistance}
            onChangeText={setBeginningDistance}
          />

          {/* Origin Input */}
          <Text style={styles.inputLabel}>Origin</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter origin location"
            value={origin}
            onChangeText={setOrigin}
          />

          {/* Destination Input */}
          <Text style={styles.inputLabel}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter destination location"
            value={destination}
            onChangeText={setDestination}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Start Trip Button */}
          <TouchableOpacity
            style={[styles.customButton, styles.modalButton]}
            onPress={handleStartTrip}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Start Trip</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.customButton, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  toggleSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
  },
  toggleText: {
    fontSize: 14,
    color: '#767577',
  },
  toggleTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  customButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  modalButton: {
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#767577',
    marginTop: 10,
  },
});
