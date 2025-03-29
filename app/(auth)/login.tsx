import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [driverCode, setDriverCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (isRegisterModalVisible && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [isRegisterModalVisible]);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'Please check your credentials and try again.'
      );
    }
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen or show a modal
    Alert.alert('Forgot Password', 'Implement forgot password logic here.');
  };

  const handleRegister = () => {
    setIsRegisterModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsRegisterModalVisible(false);
    setDriverCode('');
    setCodeError('');
  };

  const handleCodeChange = (text: string) => {
    if (text.length <= 6) {
      setDriverCode(text);
      setCodeError(''); // Clear error when user starts typing
    }
  };

  const handleSubmitCode = () => {
    // Replace this with your actual code validation logic
    if (driverCode === '123456') {
      // Code is valid, navigate or perform action
      Alert.alert('Success', 'Code is valid!');
      handleCloseModal();
      // router.push('/some-new-screen');
    } else {
      setCodeError('The code entered is not valid or has already been used.');
    }
  };

  useEffect(() => {
    if (isRegisterModalVisible) {
      // Add a small delay to ensure modal is fully rendered
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [isRegisterModalVisible]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to your account</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
          <Text style={styles.demoButtonText}>Use Demo Credentials</Text>
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
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Register Modal */}

      <Modal
        visible={isRegisterModalVisible}
        animationType="slide"
        transparent={false} // Make it non-transparent
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true} // Add this line
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.modalContent}>
            <Pressable onPress={handleCloseModal} style={styles.closeButton}>
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
                        {/* Dashed border container */}
                        <View
                          style={[
                            styles.dashedBorder,
                            driverCode[index] && styles.filledDashedBorder, // Optional: Change style when filled
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
              </View>
              <View style={styles.submitButtonContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitCode}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  forgotPasswordText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 16,
    textAlign: 'left',
  },
  demoButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  demoButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
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
  demoCredentials: {
    marginTop: 16,
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
  // Modal Styles
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'white', // Make the background opaque
    paddingTop: StatusBar.currentHeight || 0, // Add padding for the status bar
  },
  modalContent: {
    flex: 1, // Take up all available space
    paddingVertical: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    padding: 8,
    zIndex: 1, // Ensure it's above other content
  },
  centerContent: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'flex-start', // Vertically center content but a little higher
    alignItems: 'center', // Horizontally center content
    width: '100%',
  },
  modalTitleContainer: {
    width: '80%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    borderColor: '#3b82f6', // Change border color when filled
    backgroundColor: '#f0f9ff', // Optional background color
  },
  codeText: {
    fontSize: 20,
    color: '#1a1a1a',
  },
  codeInput: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    // backgroundColor: 'yellow',
  },
  codeErrorText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'left',
    width: '80%',
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 'auto',
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
  },
});
