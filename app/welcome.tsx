import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, ArrowRight, Mail, Lock, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type Mode = 'choice' | 'guest' | 'register' | 'login';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginAsGuest, registerWithEmail, loginWithEmail } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>('choice');
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleGuestLogin = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    loginAsGuest(trimmed);
    router.replace('/');
  };

  const handleRegister = async () => {
    const trimmedNick = nickname.trim();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    if (!trimmedNick || !trimmedEmail || !trimmedPass) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await registerWithEmail(trimmedNick, trimmedEmail, trimmedPass);
      if (result) {
        router.replace('/');
      } else {
        setError(t.welcome.emailAlreadyRegistered);
      }
    } catch {
      setError(t.welcome.registerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    if (!trimmedEmail || !trimmedPass) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginWithEmail(trimmedEmail, trimmedPass);
      if (result.success) {
        router.replace('/');
      } else {
        setError(result.error ?? t.welcome.loginFailed);
      }
    } catch {
      setError(t.welcome.loginError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E21', '#121837', '#0A0E21']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
          <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient
              colors={[Colors.primary, '#FF8A65']}
              style={styles.logoBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>🚫</Text>
            </LinearGradient>
            <Text style={styles.title}>
              Tabu<Text style={styles.titleAccent}>Go</Text>
            </Text>
            <View style={styles.taglineRow}>
              <Zap size={14} color={Colors.secondary} fill={Colors.secondary} />
              <Text style={styles.tagline}>{t.welcome.tagline}</Text>
              <Zap size={14} color={Colors.secondary} fill={Colors.secondary} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {mode === 'choice' && (
              <View style={styles.choiceContainer}>
                <TouchableOpacity onPress={() => setMode('guest')} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.primary, '#FF8A65']}
                    style={styles.primaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <User size={20} color="#FFF" />
                    <Text style={styles.primaryBtnText}>{t.welcome.quickLogin}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode('register')} style={styles.secondaryBtn} activeOpacity={0.7}>
                  <Mail size={18} color={Colors.textSecondary} />
                  <Text style={styles.secondaryBtnText}>{t.welcome.createAccount}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode('login')} activeOpacity={0.7}>
                  <Text style={styles.loginLink}>{t.welcome.alreadyHaveAccount}</Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'guest' && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>{t.welcome.setNickname}</Text>
                <Text style={styles.formDesc}>{t.welcome.nicknameDesc}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.nicknamePlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={15}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleGuestLogin}
                  testID="nickname-input"
                />
                <TouchableOpacity
                  onPress={handleGuestLogin}
                  disabled={!nickname.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={nickname.trim() ? [Colors.primary, '#FF8A65'] : [Colors.surface, Colors.surface]}
                    style={[styles.submitBtn, !nickname.trim() && styles.submitBtnDisabled]}
                  >
                    <Text style={[styles.submitBtnText, !nickname.trim() && styles.submitBtnTextDisabled]}>
                      {t.welcome.start}
                    </Text>
                    <ArrowRight size={18} color={nickname.trim() ? '#FFF' : Colors.textMuted} />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('choice')}>
                  <Text style={styles.backLink}>{t.common.back}</Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'register' && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>{t.welcome.createAccountTitle}</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.nicknamePlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={15}
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.emailPlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.passwordPlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={!nickname.trim() || !email.trim() || !password.trim() || isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={nickname.trim() && email.trim() && password.trim() ? [Colors.primary, '#FF8A65'] : [Colors.surface, Colors.surface]}
                    style={[styles.submitBtn, !(nickname.trim() && email.trim() && password.trim()) && styles.submitBtnDisabled]}
                  >
                    <Text style={[styles.submitBtnText, !(nickname.trim() && email.trim() && password.trim()) && styles.submitBtnTextDisabled]}>
                      {isSubmitting ? t.welcome.registering : t.welcome.register}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('choice')}>
                  <Text style={styles.backLink}>{t.common.back}</Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'login' && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>{t.welcome.loginTitle}</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.emailPlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder={t.welcome.passwordPlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={!email.trim() || !password.trim() || isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={email.trim() && password.trim() ? [Colors.primary, '#FF8A65'] : [Colors.surface, Colors.surface]}
                    style={[styles.submitBtn, !(email.trim() && password.trim()) && styles.submitBtnDisabled]}
                  >
                    <Text style={[styles.submitBtnText, !(email.trim() && password.trim()) && styles.submitBtnTextDisabled]}>
                      {isSubmitting ? t.welcome.loggingIn : t.welcome.login}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('choice')}>
                  <Text style={styles.backLink}>{t.common.back}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', gap: 12 },
  logoBg: { width: 90, height: 90, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginBottom: 8 },
  logoIcon: { fontSize: 42 },
  title: { fontSize: 44, fontWeight: '900' as const, color: Colors.text, letterSpacing: -1 },
  titleAccent: { color: Colors.primary },
  taglineRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginTop: 4 },
  tagline: { fontSize: 15, color: Colors.secondary, fontWeight: '600' as const },
  formSection: { width: '100%', marginBottom: 20 },
  choiceContainer: { gap: 14 },
  primaryBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 18, borderRadius: 16, gap: 10, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  primaryBtnText: { fontSize: 18, fontWeight: '800' as const, color: '#FFF' },
  secondaryBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  loginLink: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' as const, fontWeight: '500' as const, paddingVertical: 8, textDecorationLine: 'underline' as const },
  formContainer: { gap: 14 },
  formTitle: { fontSize: 22, fontWeight: '800' as const, color: Colors.text, textAlign: 'center' as const, marginBottom: 4 },
  formDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const, marginBottom: 4 },
  input: { backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border },
  submitBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 16, borderRadius: 16, gap: 8 },
  submitBtnDisabled: { borderWidth: 1, borderColor: Colors.border },
  submitBtnText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF' },
  submitBtnTextDisabled: { color: Colors.textMuted },
  backLink: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' as const, fontWeight: '500' as const, paddingVertical: 8 },
  errorText: { fontSize: 14, color: '#FF6B6B', textAlign: 'center' as const, fontWeight: '600' as const, backgroundColor: 'rgba(255,107,107,0.1)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, overflow: 'hidden' as const },
});
