import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useState } from 'react';
import { useServiceStationStore } from '@/stores/serviceStationStore';

interface AddServiceStationModalProps {
  visible: boolean;
  onClose: () => void;
  onStationAdded: (stationId: string) => void;
}

export default function AddServiceStationModal({
  visible,
  onClose,
  onStationAdded,
}: AddServiceStationModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [rating, setRating] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addServiceStation } = useServiceStationStore();

  const handleAddServiceStation = async () => {
    if (!name || !location || !fuelPrice || !rating) {
      setError('Please fill in all fields');
      return;
    }

    const ratingNum = parseFloat(rating);
    const fuelPriceNum = parseFloat(fuelPrice);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    if (isNaN(fuelPriceNum) || fuelPriceNum <= 0) {
      setError('Fuel price must be a positive number');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const newStation = await addServiceStation({
        name,
        location,
        fuel_price: fuelPriceNum.toFixed(2),
        rating: ratingNum.toFixed(1),
        is_global: isGlobal,
      });
      setLoading(false);
      if (newStation) {
        onStationAdded(newStation.id);
        setName('');
        setLocation('');
        setFuelPrice('');
        setRating('');
        setIsGlobal(false);
        onClose();
      }
    } catch (error: any) {
      setLoading(false);
      setError('Failed to add service station. Data saved for syncing.');
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
          <Text style={styles.modalTitle}>Add New Service Station</Text>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter station name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.inputLabel}>Fuel Price ($/L)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter fuel price"
            keyboardType="numeric"
            value={fuelPrice}
            onChangeText={setFuelPrice}
          />

          <Text style={styles.inputLabel}>Rating (1-5)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter rating"
            keyboardType="numeric"
            value={rating}
            onChangeText={setRating}
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Global Station:</Text>
            <Switch
              value={isGlobal}
              onValueChange={setIsGlobal}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isGlobal ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}

          <TouchableOpacity
            style={[styles.customButton, styles.modalButton]}
            onPress={handleAddServiceStation}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Add Station</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
            disabled={loading}
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
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
