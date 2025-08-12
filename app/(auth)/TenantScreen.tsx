import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTenantStore } from '@/stores/tenantStore';
import axios from 'axios';
import { APP_URL } from '@/lib/api';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function TenantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setTenantDomain, tenantDomain } = useTenantStore();
  const [tenantName, setTenantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tenantDomain) {
      router.replace('/login'); // Navigate to login if tenant is already set
    }
  }, [tenantDomain, router]);

  const handleSubmit = async () => {
    if (!tenantName.trim()) {
      setError('Please enter a tenant name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${APP_URL}/api/find-tenant`,
        { domain: `${tenantName.toLowerCase()}.spinthewheel.in` },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200 && response.data.domain) {
        setTenantDomain(response.data.domain); // Store the full domain (e.g., webfixerr.spinthewheel.in)
        console.log('Tenant domain set:', response.data.domain);
        router.replace('/login');
      } else {
        setError('Invalid tenant name. Please try again.');
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Network error. Please check your connection and try again.'
      );
      console.error(
        'Find tenant error:',
        error.response?.data || error.message
      );
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
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('findWorkspace')}</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder={t('enterWorkspaceName')}
          placeholderTextColor="#888"
          value={tenantName}
          onChangeText={setTenantName}
          autoCapitalize="none"
          editable={!isLoading}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{t('submit')}</Text>
          )}
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
    backgroundColor: 'white',
  },
  form: {
    gap: 16,
  },
  logo: {
    width: 300,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
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
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
