import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { useRefuelStore } from '@/stores/refuelStore';
import { useServiceStationStore } from '@/stores/serviceStationStore';
import AddServiceStationModal from '@/components/AddServiceStationModal';
import { useTranslation } from 'react-i18next';

interface AddRefuelModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddRefuelModal({
  visible,
  onClose,
}: AddRefuelModalProps) {
  const { t } = useTranslation();
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
      setError(t('kmPositive'));
      return;
    }
    if (isNaN(litresNum) || litresNum <= 0) {
      setError(t('litresPositive'));
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError(t('pricePositive'));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await addRefuel({
        service_station_id: serviceStationId,
        kilometers_at_refuel: kilometersNum.toFixed(2),
        litres_fueled: litresNum.toFixed(2),
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
      setError(t('failedAddRefuel'));
    }
  };

  const handleStationAdded = (stationId: string) => {
    setServiceStationId(stationId);
    setAddStationModalVisible(false);
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
          <Text style={styles.modalTitle}>{t('addRefuel')}</Text>

          {/* <Text style={styles.inputLabel}>{t('serviceStation')}</Text> */}
          {/* <View style={styles.pickerContainer}>
            <Picker
              selectedValue={serviceStationId}
              onValueChange={(value) => setServiceStationId(value)}
              style={styles.picker}
            >
              <Picker.Item label={t('selectServiceStation')} value="" />
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
              <Text style={styles.addStationButtonText}>{t('addNew')}</Text>
            </TouchableOpacity>
          </View> */}

          <Text style={styles.inputLabel}>{t('kmAtRefuel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('kmplaceholder')}
            keyboardType="numeric"
            value={kilometersAtRefuel}
            onChangeText={setKilometersAtRefuel}
          />

          <Text style={styles.inputLabel}>{t('litresFueled')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('litresPlaceholder')}
            keyboardType="numeric"
            value={litresFueled}
            onChangeText={setLitresFueled}
          />

          <Text style={styles.inputLabel}>{t('pricePerLitre')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('pricePlaceholder')}
            keyboardType="numeric"
            value={pricePerLitre}
            onChangeText={setPricePerLitre}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}

          <TouchableOpacity
            style={[styles.customButton, styles.modalButton]}
            onPress={handleAddRefuel}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{t('addRefuel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{t('cancel')}</Text>
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
