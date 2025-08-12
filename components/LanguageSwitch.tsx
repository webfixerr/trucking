// src/components/LanguageSwitch.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import i18n from '@/app/i18n/i18n';

const LanguageSwitch = () => {
  const [isEnglish, setIsEnglish] = useState(i18n.language === 'en');

  const toggleLanguage = () => {
    const newLang = isEnglish ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    setIsEnglish(newLang === 'en');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleContainer,
          isEnglish ? styles.enActive : styles.esActive,
        ]}
        onPress={toggleLanguage}
        activeOpacity={0.8}
      >
        <View style={styles.toggle}>
          <Text style={[styles.text, isEnglish && styles.activeText]}>EN</Text>
          <Text style={[styles.text, !isEnglish && styles.activeText]}>ES</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  toggleContainer: {
    width: 120,
    height: 40,
    borderRadius: 20,
    padding: 3,
    justifyContent: 'center',
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: '100%',
  },
  enActive: {
    backgroundColor: '#007AFF',
  },
  esActive: {
    backgroundColor: '#FF9500',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeText: {
    color: '#000',
    fontWeight: '700',
  },
});

export default LanguageSwitch;
