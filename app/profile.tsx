import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  User,
  Mail,
  Crown,
  LogOut,
  Link,
  Edit3,
  Shield,
  Clock,
  Globe,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_LABELS, AppLanguage } from '@/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, subscriptionTier, updateNickname, linkAccount, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>(user?.nickname ?? '');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkEmail, setLinkEmail] = useState<string>('');
  const [linkPassword, setLinkPassword] = useState<string>('');

  const handleSaveNickname = () => {
    const trimmed = newNickname.trim();
    if (!trimmed) return;
    updateNickname(trimmed);
    setIsEditingNick(false);
  };

  const handleLinkAccount = () => {
    if (!linkEmail.trim() || !linkPassword.trim()) {
      Alert.alert(t.common.error, t.profile.linkError);
      return;
    }
    linkAccount(linkEmail.trim(), linkPassword.trim());
    setIsLinking(false);
    setLinkEmail('');
    setLinkPassword('');
    Alert.alert(t.common.success, t.profile.linkSuccess);
  };

  const handleLogout = () => {
    Alert.alert(
      t.profile.logout,
      t.profile.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.profile.logout, style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
      ]
    );
  };

  const handleLanguageToggle = () => {
    const newLang: AppLanguage = language === 'tr' ? 'en' : 'tr';
    changeLanguage(newLang);
  };

  const tierLabel = subscriptionTier === 'premium' ? 'Premium' : subscriptionTier === 'elite' ? 'Elite' : t.subscription.free;
  const tierColor = subscriptionTier === 'free' ? Colors.textMuted : Colors.gold;
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[Colors.primary + '40', Colors.primary + '15']}
              style={styles.avatarCircle}
            >
              <User size={40} color={Colors.primary} />
            </LinearGradient>

            {isEditingNick ? (
              <View style={styles.editNickRow}>
                <TextInput
                  style={styles.nickInput}
                  value={newNickname}
                  onChangeText={setNewNickname}
                  placeholder={t.profile.newNicknamePlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  maxLength={15}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveNickname} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{t.common.save}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nickRow}>
                <Text style={styles.nickname}>{user?.nickname ?? t.profile.guest}</Text>
                <TouchableOpacity onPress={() => { setNewNickname(user?.nickname ?? ''); setIsEditingNick(true); }}>
                  <Edit3 size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {user?.isGuest && (
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>{t.profile.guestAccount}</Text>
              </View>
            )}
            {user?.email && (
              <View style={styles.emailRow}>
                <Mail size={14} color={Colors.textSecondary} />
                <Text style={styles.emailText}>{user.email}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleLanguageToggle}
            activeOpacity={0.8}
            style={styles.languageCard}
          >
            <LinearGradient
              colors={[Colors.teamA + '20', Colors.teamA + '08']}
              style={styles.subscriptionCardInner}
            >
              <View style={[styles.subIcon, { backgroundColor: Colors.teamA + '25' }]}>
                <Globe size={22} color={Colors.teamA} />
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subLabel}>{t.profile.language}</Text>
                <Text style={[styles.subTier, { color: Colors.teamA }]}>{LANGUAGE_LABELS[language]}</Text>
              </View>
              <View style={styles.langToggle}>
                <Text style={styles.langToggleText}>
                  {language === 'tr' ? 'EN' : 'TR'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/history' as any)}
            activeOpacity={0.8}
            style={styles.historyCard}
          >
            <LinearGradient
              colors={[Colors.primary + '20', Colors.primary + '08']}
              style={styles.subscriptionCardInner}
            >
              <View style={[styles.subIcon, { backgroundColor: Colors.primary + '25' }]}>
                <Clock size={22} color={Colors.primary} />
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subLabel}>{t.profile.gameHistory}</Text>
                <Text style={[styles.subTier, { color: Colors.primary }]}>{t.profile.statsAndHistory}</Text>
              </View>
              <ChevronLeft size={18} color={Colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/subscription' as any)}
            activeOpacity={0.8}
            style={styles.subscriptionCard}
          >
            <LinearGradient
              colors={subscriptionTier === 'free' ? [Colors.surface, Colors.card] : [Colors.gold + '20', Colors.gold + '08']}
              style={styles.subscriptionCardInner}
            >
              <View style={[styles.subIcon, { backgroundColor: tierColor + '25' }]}>
                <Crown size={22} color={tierColor} />
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subLabel}>{t.profile.subscription}</Text>
                <Text style={[styles.subTier, { color: tierColor }]}>{tierLabel}</Text>
              </View>
              <ChevronLeft size={18} color={Colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>

          {user?.isGuest && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Link size={18} color={Colors.teamA} />
                <Text style={styles.sectionTitle}>{t.profile.linkAccount}</Text>
              </View>
              <Text style={styles.sectionDesc}>{t.profile.linkAccountDesc}</Text>

              {isLinking ? (
                <View style={styles.linkForm}>
                  <TextInput
                    style={styles.formInput}
                    placeholder={t.welcome.emailPlaceholder}
                    placeholderTextColor={Colors.textMuted}
                    value={linkEmail}
                    onChangeText={setLinkEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder={t.welcome.passwordPlaceholder}
                    placeholderTextColor={Colors.textMuted}
                    value={linkPassword}
                    onChangeText={setLinkPassword}
                    secureTextEntry
                  />
                  <View style={styles.linkActions}>
                    <TouchableOpacity onPress={() => setIsLinking(false)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLinkAccount} activeOpacity={0.8}>
                      <LinearGradient colors={[Colors.teamA, Colors.teamA + 'CC']} style={styles.linkBtn}>
                        <Text style={styles.linkBtnText}>{t.profile.linkButton}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsLinking(true)} activeOpacity={0.8}>
                  <LinearGradient colors={[Colors.teamA, Colors.teamA + 'CC']} style={styles.linkAccountBtn}>
                    <Shield size={18} color="#FFF" />
                    <Text style={styles.linkAccountBtnText}>{t.profile.linkButton}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.profile.accountType}</Text>
              <Text style={styles.infoValue}>{user?.isGuest ? t.profile.guest : t.profile.registered}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.profile.membership}</Text>
              <Text style={[styles.infoValue, { color: tierColor }]}>{tierLabel}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.profile.registrationDate}</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dateLocale) : '-'}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.logoutText}>{t.profile.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center' as const, alignItems: 'center' as const },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  avatarSection: { alignItems: 'center' as const, paddingVertical: 24, gap: 12 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  nickRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  nickname: { fontSize: 26, fontWeight: '800' as const, color: Colors.text },
  editNickRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  nickInput: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border, minWidth: 150 },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: '#FFF', fontWeight: '700' as const, fontSize: 14 },
  guestBadge: { backgroundColor: Colors.warning + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  guestBadgeText: { fontSize: 12, fontWeight: '600' as const, color: Colors.warning },
  emailRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  emailText: { fontSize: 14, color: Colors.textSecondary },
  languageCard: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 12 },
  historyCard: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 12 },
  subscriptionCard: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 24 },
  subscriptionCardInner: { flexDirection: 'row' as const, alignItems: 'center' as const, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  subIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center' as const, alignItems: 'center' as const },
  subInfo: { flex: 1 },
  subLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' as const },
  subTier: { fontSize: 18, fontWeight: '800' as const, marginTop: 2 },
  langToggle: { backgroundColor: Colors.teamA, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langToggleText: { fontSize: 13, fontWeight: '700' as const, color: '#FFF' },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  sectionDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  linkForm: { gap: 12 },
  formInput: { backgroundColor: Colors.surfaceLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  linkActions: { flexDirection: 'row' as const, gap: 10, justifyContent: 'flex-end' as const },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceLight },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' as const, fontSize: 14 },
  linkBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  linkBtnText: { color: '#FFF', fontWeight: '700' as const, fontSize: 14 },
  linkAccountBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, paddingVertical: 14, borderRadius: 12 },
  linkAccountBtnText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
  infoRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 6 },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  logoutBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 10, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error + '30', marginBottom: 20 },
  logoutText: { fontSize: 15, fontWeight: '600' as const, color: Colors.error },
});
