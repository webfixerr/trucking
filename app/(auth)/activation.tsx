// app/(auth)/activation.tsx
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTenantStore } from '@/stores/tenantStore';
import { activateUser, resendPin } from '@/services/db/authService';

export default function ActivationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { tenantDomain: tenant } = useTenantStore();
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value.length === 1 && index < 3) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const handleActivate = async () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }
    if (!email || !tenant) {
      setError('Missing email or tenant information');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await activateUser(email, fullPin, tenant);
      Alert.alert('Success', 'Account activated successfully!', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (err: any) {
      setError(err.message || 'Invalid activation code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !tenant) {
      setError('Missing email or tenant information');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await resendPin(email, tenant);
      Alert.alert('Success', 'Activation code resent successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Activate Your Account</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to {email || 'your email'}
        </Text>
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              style={[styles.pinInput, error ? styles.inputError : null]}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={(e) => handleKeyPress(index, e)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry={false}
              autoFocus={index === 0}
              textAlign="center"
            />
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleActivate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Activate</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend} disabled={isLoading}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  form: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinInput: {
    backgroundColor: '#f5f5f5',
    color:'#000',
    padding: 16,
    borderRadius: 12,
    fontSize: 24,
    width: 60,
    height: 60,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resendText: {
    color: '#3b82f6',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
