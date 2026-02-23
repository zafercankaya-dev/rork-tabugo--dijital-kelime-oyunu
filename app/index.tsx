import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Crown, User, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetGame } = useGame();
  const { user, isLoading, subscriptionTier } = useAuth();
  const { t } = useLanguage();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/welcome' as any);
      return;
    }
  }, [isLoading, user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(buttonSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNewGame = () => {
    resetGame();
    router.push('/setup' as any);
  };

  const orb1Translate = orb1.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });
  const orb2Translate = orb2.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });
  const rotateZ = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  if (isLoading) return <View style={styles.container}><LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} /></View>;
  if (!user) return <View style={styles.container}><LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} /></View>;

  const tierLabel = subscriptionTier === 'premium' ? 'Premium' : subscriptionTier === 'elite' ? 'Elite' : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E21', '#121837', '#0A0E21']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1Translate }, { translateX: orb1Translate }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: orb2Translate }] },
        ]}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.push('/profile' as any)}
          style={styles.profileBtn}
          activeOpacity={0.7}
          testID="profile-button"
        >
          <View style={styles.profileAvatar}>
            <User size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.profileNick}>{user.nickname}</Text>
            {tierLabel && <Text style={styles.profileTier}>{tierLabel}</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/subscription' as any)}
          style={styles.crownBtn}
          activeOpacity={0.7}
          testID="subscription-button"
        >
          <Crown size={20} color={subscriptionTier === 'free' ? Colors.textMuted : Colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { rotateZ },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, '#FF8A65']}
              style={styles.logoBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>🚫</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Text style={styles.title}>
              Tabu<Text style={styles.titleAccent}>Go</Text>
            </Text>
          </Animated.View>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            {t.home.subtitle}
          </Animated.Text>

          <Animated.View style={[styles.taglineRow, { opacity: subtitleOpacity }]}>
            <Zap size={14} color={Colors.secondary} fill={Colors.secondary} />
            <Text style={styles.tagline}>{t.home.tagline}</Text>
            <Zap size={14} color={Colors.secondary} fill={Colors.secondary} />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleNewGame}
              activeOpacity={0.8}
              testID="new-game-button"
            >
              <LinearGradient
                colors={[Colors.primary, '#FF8A65']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Play size={24} color="#FFF" fill="#FFF" />
                <Text style={styles.primaryButtonText}>{t.home.newGame}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPress={() => router.push('/profile' as any)}
            >
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>{t.home.profile}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPress={() => router.push('/subscription' as any)}
            >
              <Crown size={18} color={Colors.gold} />
              <Text style={styles.secondaryButtonText}>{t.home.premium}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.version, { opacity: subtitleOpacity }]}>
          {t.home.version}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 200,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 90, 60, 0.06)',
    top: -50,
    right: -80,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    bottom: 100,
    left: -60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNick: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profileTier: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  crownBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  taglineRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 16,
  },
  tagline: {
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  buttonSection: {
    width: '100%',
    gap: 14,
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondaryRow: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
});
