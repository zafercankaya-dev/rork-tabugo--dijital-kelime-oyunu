import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

let Purchases: any = null;
try {
  if (Platform.OS !== 'web') {
    Purchases = require('react-native-purchases').default;
  }
} catch (e) {
  console.log('[RC] Failed to load purchases module:', e);
}

const AUTH_STORAGE_KEY = '@tabugo_auth';
const ACCOUNTS_STORAGE_KEY = '@tabugo_accounts';

export interface UserProfile {
  id: string;
  nickname: string;
  email?: string;
  isGuest: boolean;
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'plus' | 'elite';

function generateGuestId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function getRCApiKey(): string {
  if (Platform.OS === 'web') return '';
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: '',
  }) ?? '';
}

let rcConfigured = false;

async function configureRC(userId: string) {
  if (Platform.OS === 'web' || !Purchases) return;
  const apiKey = getRCApiKey();
  if (!apiKey || rcConfigured) return;
  try {
    await Purchases.configure({ apiKey, appUserID: userId });
    rcConfigured = true;
    console.log('[RC] Configured for user:', userId);
  } catch (e: any) {
    console.log('[RC] Configure error (non-blocking):', e?.message ?? e);
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['auth_profile'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
      return null;
    },
  });

  useEffect(() => {
    if (profileQuery.data !== undefined) {
      setUser(profileQuery.data);
      setIsLoading(false);
      if (profileQuery.data) {
        configureRC(profileQuery.data.id);
      }
    }
  }, [profileQuery.data]);

  const entitlementQuery = useQuery({
    queryKey: ['rc_entitlements'],
    queryFn: async () => {
      if (Platform.OS === 'web' || !Purchases) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        return info;
      } catch (e) {
        console.log('[RC] Entitlement check error:', e);
        return null;
      }
    },
    enabled: !!user && rcConfigured && Platform.OS !== 'web',
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (entitlementQuery.data) {
      const info = entitlementQuery.data;
      if (info.entitlements?.active?.['pro']) {
        setSubscriptionTier('plus');
      } else {
        setSubscriptionTier('free');
      }
    }
  }, [entitlementQuery.data]);

  const saveProfileMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    },
    onSuccess: (profile) => {
      setUser(profile);
      queryClient.setQueryData(['auth_profile'], profile);
      configureRC(profile.id).catch(() => {});
    },
  });

  const loginAsGuest = useCallback((nickname: string) => {
    const profile: UserProfile = {
      id: generateGuestId(),
      nickname,
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    saveProfileMutation.mutate(profile);
    return profile;
  }, [saveProfileMutation]);

  const registerWithEmail = useCallback(async (nickname: string, email: string, password: string): Promise<UserProfile | null> => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      const accounts: Record<string, { profile: UserProfile; password: string }> = stored ? JSON.parse(stored) : {};
      const normalizedEmail = email.toLowerCase().trim();
      if (accounts[normalizedEmail]) {
        console.log('[Auth] Email already registered:', normalizedEmail);
        return null;
      }
      const profile: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        nickname,
        email: normalizedEmail,
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      accounts[normalizedEmail] = { profile, password };
      await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      saveProfileMutation.mutate(profile);
      console.log('[Auth] Registered:', normalizedEmail);
      return profile;
    } catch (e) {
      console.log('[Auth] Register error:', e);
      return null;
    }
  }, [saveProfileMutation]);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      const accounts: Record<string, { profile: UserProfile; password: string }> = stored ? JSON.parse(stored) : {};
      const normalizedEmail = email.toLowerCase().trim();
      const account = accounts[normalizedEmail];
      if (!account) {
        console.log('[Auth] Account not found:', normalizedEmail);
        return { success: false, error: 'Bu email ile kayıtlı hesap bulunamadı.' };
      }
      if (account.password !== password) {
        console.log('[Auth] Wrong password for:', normalizedEmail);
        return { success: false, error: 'Şifre hatalı.' };
      }
      saveProfileMutation.mutate(account.profile);
      console.log('[Auth] Login success:', normalizedEmail);
      return { success: true };
    } catch (e) {
      console.log('[Auth] Login error:', e);
      return { success: false, error: 'Giriş sırasında bir hata oluştu.' };
    }
  }, [saveProfileMutation]);

  const linkAccount = useCallback((email: string, _password: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      email,
      isGuest: false,
    };
    saveProfileMutation.mutate(updated);
  }, [user, saveProfileMutation]);

  const updateNickname = useCallback((nickname: string) => {
    if (!user) return;
    const updated: UserProfile = { ...user, nickname };
    saveProfileMutation.mutate(updated);
  }, [user, saveProfileMutation]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setSubscriptionTier('free');
    queryClient.setQueryData(['auth_profile'], null);
    rcConfigured = false;
  }, [queryClient]);

  const refreshEntitlements = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rc_entitlements'] });
  }, [queryClient]);

  return {
    user,
    isLoading,
    subscriptionTier,
    loginAsGuest,
    registerWithEmail,
    loginWithEmail,
    linkAccount,
    updateNickname,
    logout,
    refreshEntitlements,
    isLoggedIn: !!user,
  };
});
