import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';

let Purchases: any = null;
try {
  if (Platform.OS !== 'web') {
    Purchases = require('react-native-purchases').default;
  }
} catch (e) {
  console.log('[RC] Failed to load purchases module:', e);
}
import {
  ChevronLeft,
  Crown,
  Check,
  Zap,
  Star,
  RefreshCw,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  highlight?: boolean;
  color: string;
  icon: React.ReactNode;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscriptionTier, refreshEntitlements } = useAuth();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const offeringsQuery = useQuery({
    queryKey: ['rc_offerings'],
    queryFn: async () => {
      if (Platform.OS === 'web' || !Purchases) return null;
      try {
        const offerings = await Purchases.getOfferings();
        console.log('[RC] Offerings:', JSON.stringify(offerings.current?.availablePackages?.map((p: any) => p.identifier)));
        return offerings;
      } catch (e) {
        console.log('[RC] Offerings error:', e);
        return null;
      }
    },
    enabled: Platform.OS !== 'web',
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      if (Platform.OS === 'web' || !Purchases) throw new Error(t.subscription.webNotSupported);
      const offerings = offeringsQuery.data;
      if (!offerings?.current) throw new Error(t.subscription.offersNotLoaded);
      const pkg = offerings.current.availablePackages.find((p: any) => p.identifier === packageId);
      if (!pkg) throw new Error(t.subscription.packageNotFound);
      const result = await Purchases.purchasePackage(pkg);
      return result;
    },
    onSuccess: () => {
      refreshEntitlements();
      Alert.alert(t.common.success, t.subscription.purchaseSuccess, [
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      if (error?.userCancelled) return;
      console.log('[RC] Purchase error:', error);
      Alert.alert(t.common.error, t.subscription.purchaseError);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS === 'web' || !Purchases) throw new Error(t.subscription.webNotSupported);
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: (info) => {
      refreshEntitlements();
      if (info.entitlements?.active?.['pro']) {
        Alert.alert(t.common.success, t.subscription.restoreSuccess);
      } else {
        Alert.alert(t.common.error, t.subscription.restoreNotFound);
      }
    },
    onError: () => {
      Alert.alert(t.common.error, t.subscription.restoreError);
    },
  });

  const handlePurchase = () => {
    const packageId = selectedPlan === 'monthly' ? '$rc_monthly' : '$rc_annual';
    purchaseMutation.mutate(packageId);
  };

  const monthlyPkg = offeringsQuery.data?.current?.availablePackages.find((p: any) => p.identifier === '$rc_monthly');
  const yearlyPkg = offeringsQuery.data?.current?.availablePackages.find((p: any) => p.identifier === '$rc_annual');

  const monthlyPrice = monthlyPkg?.product?.priceString ?? '$4.99';
  const yearlyPrice = yearlyPkg?.product?.priceString ?? '$29.99';

  const freeFeatures: PlanFeature[] = [
    { text: t.subscription.basicWordPool, included: true },
    { text: t.subscription.unlimitedGames, included: true },
    { text: t.subscription.playerRange, included: true },
    { text: t.subscription.expandedWordPool, included: false },
    { text: t.subscription.adFree, included: false },
    { text: t.subscription.customDifficulty, included: false },
  ];

  const plusFeatures: PlanFeature[] = [
    { text: t.subscription.basicWordPool, included: true },
    { text: t.subscription.unlimitedGames, included: true },
    { text: t.subscription.playerRange, included: true },
    { text: t.subscription.expandedWordPool, included: true },
    { text: t.subscription.adFree, included: true },
    { text: t.subscription.customDifficulty, included: false },
  ];

  const eliteFeatures: PlanFeature[] = [
    { text: t.subscription.basicWordPool, included: true },
    { text: t.subscription.unlimitedGames, included: true },
    { text: t.subscription.playerRange, included: true },
    { text: t.subscription.expandedWordPool, included: true },
    { text: t.subscription.adFree, included: true },
    { text: t.subscription.customDifficulty, included: true },
  ];

  const plans: Plan[] = [
    {
      id: 'free',
      name: t.subscription.freeName,
      price: '₺0',
      period: '',
      features: freeFeatures,
      color: Colors.textMuted,
      icon: <Star size={22} color={Colors.textMuted} />,
    },
    {
      id: 'plus',
      name: 'Plus',
      price: selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice,
      period: selectedPlan === 'monthly' ? '/mo' : '/yr',
      features: plusFeatures,
      highlight: true,
      color: Colors.gold,
      icon: <Crown size={22} color={Colors.gold} />,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: t.subscription.comingSoon,
      period: '',
      features: eliteFeatures,
      color: Colors.primary,
      icon: <Zap size={22} color={Colors.primary} />,
    },
  ];

  const isLoading = purchaseMutation.isPending || restoreMutation.isPending;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#0F1328', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.subscription.title}</Text>
        <TouchableOpacity onPress={() => restoreMutation.mutate()} style={styles.restoreBtn} disabled={isLoading}>
          <RefreshCw size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <LinearGradient colors={[Colors.gold + '25', Colors.gold + '08']} style={styles.heroBg}>
            <Crown size={44} color={Colors.gold} />
          </LinearGradient>
          <Text style={styles.heroTitle}>{t.subscription.heroTitle}</Text>
          <Text style={styles.heroDesc}>{t.subscription.heroDesc}</Text>
        </View>

        {subscriptionTier !== 'free' && (
          <View style={styles.activeBanner}>
            <Check size={18} color={Colors.success} />
            <Text style={styles.activeBannerText}>{t.subscription.activeSubscription} {subscriptionTier === 'plus' ? 'Plus' : 'Elite'}</Text>
          </View>
        )}

        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            style={[styles.toggleBtn, selectedPlan === 'monthly' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, selectedPlan === 'monthly' && styles.toggleTextActive]}>{t.subscription.monthly}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            style={[styles.toggleBtn, selectedPlan === 'yearly' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, selectedPlan === 'yearly' && styles.toggleTextActive]}>{t.subscription.yearly}</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>%50</Text>
            </View>
          </TouchableOpacity>
        </View>

        {plans.map((plan) => (
          <View key={plan.id} style={[styles.planCard, plan.highlight && styles.planCardHighlight]}>
            <LinearGradient
              colors={plan.highlight ? [plan.color + '15', plan.color + '05'] : [Colors.surface, Colors.card]}
              style={styles.planCardInner}
            >
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>{plan.icon}</View>
                <View style={styles.planTitleSection}>
                  <Text style={[styles.planName, plan.highlight && { color: plan.color }]}>{plan.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    {plan.period ? <Text style={styles.planPeriod}>{plan.period}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <View style={[styles.featureCheck, { backgroundColor: feature.included ? Colors.success + '20' : Colors.textMuted + '15' }]}>
                      {feature.included ? (
                        <Check size={12} color={Colors.success} />
                      ) : (
                        <Text style={styles.featureX}>—</Text>
                      )}
                    </View>
                    <Text style={[styles.featureText, !feature.included && styles.featureTextDisabled]}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {subscriptionTier === 'free' && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity onPress={handlePurchase} disabled={isLoading} activeOpacity={0.8}>
            <LinearGradient
              colors={isLoading ? [Colors.surface, Colors.surface] : [Colors.gold, '#E6B800']}
              style={styles.purchaseButton}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <>
                  <Crown size={20} color="#1A1200" />
                  <Text style={styles.purchaseText}>
                    {t.subscription.upgradeTo} — {selectedPlan === 'monthly' ? monthlyPrice + '/mo' : yearlyPrice + '/yr'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center' as const, alignItems: 'center' as const },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  restoreBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center' as const, alignItems: 'center' as const },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  heroSection: { alignItems: 'center' as const, paddingVertical: 20, gap: 12 },
  heroBg: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  heroTitle: { fontSize: 26, fontWeight: '900' as const, color: Colors.text },
  heroDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' as const },
  activeBanner: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, backgroundColor: Colors.success + '15', paddingVertical: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.success + '30' },
  activeBannerText: { fontSize: 14, fontWeight: '600' as const, color: Colors.success },
  toggleRow: { flexDirection: 'row' as const, gap: 10, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row' as const, gap: 6 },
  toggleBtnActive: { backgroundColor: Colors.gold + '15', borderColor: Colors.gold },
  toggleText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.gold },
  saveBadge: { backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveBadgeText: { fontSize: 10, fontWeight: '700' as const, color: '#FFF' },
  planCard: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 14 },
  planCardHighlight: { borderWidth: 1, borderColor: Colors.gold + '50' },
  planCardInner: { padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  planHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14, marginBottom: 16 },
  planIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center' as const, alignItems: 'center' as const },
  planTitleSection: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '800' as const, color: Colors.text },
  priceRow: { flexDirection: 'row' as const, alignItems: 'baseline' as const, gap: 2 },
  planPrice: { fontSize: 22, fontWeight: '900' as const, color: Colors.text },
  planPeriod: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' as const },
  featureList: { gap: 8 },
  featureItem: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  featureCheck: { width: 22, height: 22, borderRadius: 6, justifyContent: 'center' as const, alignItems: 'center' as const },
  featureX: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' as const },
  featureText: { fontSize: 13, color: Colors.text, fontWeight: '500' as const, flex: 1 },
  featureTextDisabled: { color: Colors.textMuted },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  purchaseButton: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 16, borderRadius: 16, gap: 10 },
  purchaseText: { fontSize: 16, fontWeight: '800' as const, color: '#1A1200' },
});
