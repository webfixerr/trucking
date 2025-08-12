// src/components/AddTripModal.tsx
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddTripModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (trip: {
    origin: string;
    destination: string;
    beginning_kilometers: string;
    started_at: string;
  }) => void;
}

export default function AddTripModal({
  visible,
  onClose,
  onSubmit,
}: AddTripModalProps) {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [beginningKilometers, setBeginningKilometers] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!origin || !destination || !beginningKilometers) {
      setError(t('allFields'));
      return;
    }
    const kilometersNum = parseFloat(beginningKilometers);
    if (isNaN(kilometersNum) || kilometersNum <= 0) {
      setError(t('beginkmPositive'));
      return;
    }
    setError('');
    onSubmit({
      origin,
      destination,
      beginning_kilometers: kilometersNum.toFixed(2),
      started_at: new Date().toISOString(),
    });
    setOrigin('');
    setDestination('');
    setBeginningKilometers('');
    onClose();
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
          <Text style={styles.modalTitle}>{t('startNewJourney')}</Text>
          <Text style={styles.inputLabel}>{t('origin')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('originPlaceholder')}
            value={origin}
            onChangeText={setOrigin}
          />
          <Text style={styles.inputLabel}>{t('destination')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('destinationPlaceholder')}
            value={destination}
            onChangeText={setDestination}
          />
          <Text style={styles.inputLabel}>{t('beginningKilometers')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('beginningKilometersPlaceholder')}
            keyboardType="numeric"
            value={beginningKilometers}
            onChangeText={setBeginningKilometers}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.customButton, styles.modalButton]}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{t('startJourney')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.customButton, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{t('cancel')}</Text>
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
