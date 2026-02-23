import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLanguage, Translations } from '@/i18n/types';
import { getTranslations } from '@/i18n';

const LANGUAGE_STORAGE_KEY = '@tabugo_language';

function getDeviceLanguage(): AppLanguage {
  try {
    let locale = 'en';
    if (Platform.OS === 'web') {
      locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
    } else if (Platform.OS === 'ios') {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        'en';
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
    const lang = locale.toLowerCase().substring(0, 2);
    if (lang === 'tr') return 'tr';
    return 'en';
  } catch (e) {
    console.log('[Language] Error detecting device language:', e);
    return 'en';
  }
}

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<AppLanguage>(getDeviceLanguage());
  const [isReady, setIsReady] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const langQuery = useQuery({
    queryKey: ['app_language'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'tr' || stored === 'en') {
        return stored as AppLanguage;
      }
      return null;
    },
  });

  useEffect(() => {
    if (langQuery.data !== undefined) {
      if (langQuery.data) {
        setLanguage(langQuery.data);
      }
      setIsReady(true);
    }
  }, [langQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (lang: AppLanguage) => {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      return lang;
    },
    onSuccess: (lang) => {
      setLanguage(lang);
      queryClient.setQueryData(['app_language'], lang);
      console.log('[Language] Saved language:', lang);
    },
  });

  const changeLanguage = useCallback((lang: AppLanguage) => {
    saveMutation.mutate(lang);
  }, [saveMutation]);

  const t: Translations = useMemo(() => getTranslations(language), [language]);

  return {
    language,
    isReady,
    changeLanguage,
    t,
  };
});
