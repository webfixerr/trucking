import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onYes: (truckMileage: string, gasolineLitres: string) => void;
}

export default function TripQuestionModal({
  visible,
  onClose,
  onYes,
}: TripQuestionModalProps) {
  const [truckMileage, setTruckMileage] = useState('');
  const [gasolineLitres, setGasolineLitres] = useState('');

  const handleYes = () => {
    onYes(truckMileage, gasolineLitres);
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
                <Text style={styles.modalTitle}>Are you going on a trip?</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputModal}
                  placeholder="Truck's Mileage"
                  value={truckMileage}
                  onChangeText={setTruckMileage}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.inputModal}
                  placeholder="Gasoline Litres (optional)"
                  value={gasolineLitres}
                  onChangeText={setGasolineLitres}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalButtonsContainer}>
                <Pressable
                  style={[styles.button, styles.buttonYes]}
                  onPress={handleYes}
                >
                  <Text style={styles.textStyle}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonNo]}
                  onPress={onClose}
                >
                  <Text style={styles.textStyle}>No</Text>
                </Pressable>
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
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    width: '37%',
  },
  buttonYes: {
    backgroundColor: '#2196F3',
  },
  buttonNo: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOuterPadding: {
    paddingHorizontal: 12,
  },
});
