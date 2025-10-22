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
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    if (tenantDomain) {
      router.replace('/login'); // Navigate to login if tenant is already set
    }
  }, [tenantDomain, router]);

  const handleTenantChange = (text: string) => {
    setTenantName(text);
    setDisable(false);
  };

  const handleSubmit = async () => {
    if (!tenantName.trim()) {
      setError(t('errorCode'));
      setDisable(true);
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
        <Image
          source={require('@/assets/images/truck.jpeg')}
          style={styles.logo2}
        />
        <Text style={styles.title}>{t('findWorkspace')}</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder={t('enterWorkspaceName')}
          placeholderTextColor="#888"
          value={tenantName}
          onChangeText={handleTenantChange}
          autoCapitalize="none"
          editable={!isLoading}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            styles.submitButton,
            disable && styles.submitButtonDisabled,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading || disable}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.codeHint}>{t('codeHint')}</Text>
        <TouchableOpacity style={styles.startBtn}>
          <Text style={[styles.submitButtonText, styles.startBtnText]}>
            {t('startText')}
          </Text>
        </TouchableOpacity>
        <LanguageSwitch />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'white',
  },
  form: {
    gap: 16,
  },
  logo: {
    width: 350,
    height: 100,
  },
  logo2: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    color: 'white',
    backgroundColor: '#E4E4E7',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  codeHint: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '400',
  },
  startBtn: {
    backgroundColor: '#6D28D9',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 8px 6px rgba(0, 0, 0, 0.1)',
  },
  startBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
