// app/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import es from './es.json';
import type { LanguageDetectorAsyncModule } from 'i18next';

const lang = "en"

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect(
    callback: (lang: string | readonly string[] | undefined) => void
  ) {
    AsyncStorage.getItem('language')
      .then((storedLang) => {
        console.log('Stored language:', storedLang);
        if (storedLang && ['en', 'es'].includes(storedLang)) {
          callback(storedLang); // Use stored language if set by user
          return;
        }
        // Default to Spanish ('es') on first load, ignoring device language
        console.log('No stored language, defaulting to Spanish');
        callback(lang);
      })
      .catch((error) => {
        console.error('Language detection error:', error);
        callback(lang);
      });
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('language', language);
      console.log('Cached language:', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: lang, // Default to Spanish
    interpolation: { escapeValue: false },
    debug: true,
  })
  .then(() => console.log('i18next initialized'))
  .catch((error) => console.error('i18next initialization error:', error));

export default i18n;
