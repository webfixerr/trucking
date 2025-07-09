import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

interface LoginFormProps {
  onRegisterPress: () => void;
}

export default function LoginForm({ onRegisterPress }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    // Placeholder for forgot password logic
    alert('Implement forgot password logic here.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Image
          source={require('../../assets/images/logo.png')}
          alt="RoadFuel"
          style={{ width: 200, height: 40 }}
        />
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Sign in</Text>
          )}
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New ? </Text>
          <TouchableOpacity onPress={onRegisterPress}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  logo: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 16,
    textAlign: 'left',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
