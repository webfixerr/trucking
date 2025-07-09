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
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { useRefuelStore } from '@/stores/refuelStore';
import { useServiceStationStore } from '@/stores/serviceStationStore';
import { ServiceStation } from '@/types/serviceStation';

interface AddRefuelModalProps {
  visible: boolean;
  onClose: () => void;
}

interface AddServiceStationModalProps {
  visible: boolean;
  onClose: () => void;
  onStationAdded: (stationId: string) => void;
}

function AddServiceStationModal({
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

          <Text style={styles.inputLabel}>Fuel Price ($/gal)</Text>
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

export default function AddRefuelModal({
  visible,
  onClose,
}: AddRefuelModalProps) {
  const [kilometersAtRefuel, setKilometersAtRefuel] = useState('');
  const [litresFueled, setLitresFueled] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState('');
  const [serviceStationId, setServiceStationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addStationModalVisible, setAddStationModalVisible] = useState(false);
  const { addRefuel } = useRefuelStore();
  const { serviceStations, loadServiceStations } = useServiceStationStore();

  useEffect(() => {
    if (visible) {
      loadServiceStations();
    }
  }, [visible]);

  const handleAddRefuel = async () => {
    if (
      !kilometersAtRefuel ||
      !litresFueled ||
      !pricePerLitre ||
      !serviceStationId
    ) {
      setError('Please fill in all fields');
      return;
    }

    const kilometersNum = parseFloat(kilometersAtRefuel);
    const litresNum = parseFloat(litresFueled);
    const priceNum = parseFloat(pricePerLitre);
    if (isNaN(kilometersNum) || kilometersNum <= 0) {
      setError('Kilometers must be a positive number');
      return;
    }
    if (isNaN(litresNum) || litresNum <= 0) {
      setError('Gallons fueled must be a positive number');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price per gallon must be a positive number');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await addRefuel({
        service_station_id: serviceStationId,
        kilometers_at_refuel: kilometersNum.toFixed(2),
        litres_fueled: litresNum.toFixed(2), // Sent as gallons
        price_per_litre: priceNum.toFixed(2),
      });
      setLoading(false);
      setKilometersAtRefuel('');
      setLitresFueled('');
      setPricePerLitre('');
      setServiceStationId('');
      onClose();
    } catch (error: any) {
      setLoading(false);
      setError('Failed to add refuel. Data saved for syncing.');
    }
  };

  const handleStationAdded = (stationId: string) => {
    setServiceStationId(stationId);
    loadServiceStations(); // Refresh dropdown
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
          <Text style={styles.modalTitle}>Add Refuel</Text>

          {/* Service Station Picker */}
          <Text style={styles.inputLabel}>Service Station</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={serviceStationId}
              onValueChange={(value) => setServiceStationId(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a service station" value="" />
              {serviceStations.map((station) => (
                <Picker.Item
                  key={station.id}
                  label={`${station.name} - ${station.location}`}
                  value={station.id}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.addStationButton}
              onPress={() => setAddStationModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.addStationButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {/* Kilometers at Refuel Input */}
          <Text style={styles.inputLabel}>Kilometers at Refuel</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter kilometers at refuel"
            keyboardType="numeric"
            value={kilometersAtRefuel}
            onChangeText={setKilometersAtRefuel}
          />

          {/* Gallons Fueled Input */}
          <Text style={styles.inputLabel}>Gallons Fueled</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter gallons fueled"
            keyboardType="numeric"
            value={litresFueled}
            onChangeText={setLitresFueled}
          />

          {/* Price per Gallon Input */}
          <Text style={styles.inputLabel}>Price per Gallon</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price per gallon"
            keyboardType="numeric"
            value={pricePerLitre}
            onChangeText={setPricePerLitre}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}

          {/* Add Refuel Button */}
          <TouchableOpacity
            style={[styles.customButton, styles.modalButton]}
            onPress={handleAddRefuel}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Add Refuel</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
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

      <AddServiceStationModal
        visible={addStationModalVisible}
        onClose={() => setAddStationModalVisible(false)}
        onStationAdded={handleStationAdded}
      />
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
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
  },
  addStationButton: {
    marginTop: 8,
    padding: 8,
  },
  addStationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
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
