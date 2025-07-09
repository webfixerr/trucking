import React, { useState, useRef, useEffect } from 'react';
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

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onValidCode: () => void;
}

export default function RegisterModal({
  visible,
  onClose,
  onValidCode,
}: RegisterModalProps) {
  const [driverCode, setDriverCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && hiddenInputRef.current) {
      setTimeout(() => hiddenInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleCodeChange = (text: string) => {
    if (text.length <= 6) {
      setDriverCode(text);
      setCodeError('');
    }
  };

  const handleSubmitCode = async () => {
    if (driverCode.length !== 6) {
      setCodeError('Please enter a 6-digit driver code');
      return;
    }

    try {
      // Placeholder API call to validate driver code
      const response = await api.post('/register', { driver_code: driverCode });
      if (response.status === 200) {
        onValidCode(); // Proceed to trip question modal
        onClose();
      } else {
        setCodeError('The code entered is not valid or has already been used.');
      }
    } catch (error: any) {
      setCodeError(
        error.response?.data?.message ||
          'Failed to validate code. Please try again.'
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
      <View style={styles.fullScreenModalContainer}>
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
                <Text style={styles.modalTitle}>Enter your driver code</Text>
              </View>
              <View style={styles.codeInputsContainer}>
                {[...Array(6)].map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => hiddenInputRef.current?.focus()}
                  >
                    <View style={styles.codeInputContainer}>
                      <View
                        style={[
                          styles.dashedBorder,
                          driverCode[index] && styles.filledDashedBorder,
                        ]}
                      >
                        <Text style={styles.codeText}>
                          {driverCode[index] || ''}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
              <TextInput
                ref={hiddenInputRef}
                style={styles.hiddenInput}
                value={driverCode}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
                showSoftInputOnFocus={true}
              />
              {codeError ? (
                <Text style={styles.codeErrorText}>{codeError}</Text>
              ) : null}
              <View style={styles.submitButtonContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitCode}
                >
                  <Text style={styles.submitButtonText}>Next</Text>
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
    paddingTop: 24, // Adjust for status bar
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
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '80%',
  },
  codeInputContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedBorder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'android' && {
      overflow: 'hidden',
      position: 'relative',
    }),
  },
  filledDashedBorder: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  codeText: {
    fontSize: 20,
    color: '#1a1a1a',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  codeErrorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'left',
    width: '80%',
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
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
