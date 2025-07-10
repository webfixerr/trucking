import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTripStore } from '@/stores/tripStore';

interface StartTripModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StartTripModal({
  visible,
  onClose,
}: StartTripModalProps) {
  const { addTrip, setJourneyStarted } = useTripStore();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [beginningKilometers, setBeginningKilometers] = useState('');

  const handleStartTrip = async () => {
    if (!origin || !destination || !beginningKilometers) {
      alert('Please fill all fields');
      return;
    }
    try {
      await addTrip({
        origin,
        destination,
        beginning_kilometers: beginningKilometers,
        started_at: new Date().toISOString(),
        active: true,
        end_notification_sent: true,
      });
      setJourneyStarted(true);
      setOrigin('');
      setDestination('');
      setBeginningKilometers('');
      onClose();
    } catch (error) {
      alert('Failed to start trip. Data saved for syncing.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Start New Journey</Text>

          <Text style={styles.label}>Origin</Text>
          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            placeholder="Enter origin"
          />
          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination"
          />
          <Text style={styles.label}>Beginning Kilometers</Text>
          <TextInput
            style={styles.input}
            value={beginningKilometers}
            onChangeText={setBeginningKilometers}
            placeholder="Enter beginning kilometers"
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleStartTrip}
            >
              <Text style={styles.buttonText}>Start Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
  },
  submitButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
