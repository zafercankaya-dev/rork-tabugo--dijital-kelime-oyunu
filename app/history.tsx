import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Crown,
  Lock,
  ChevronRight,
  Trash2,
  Award,
  Zap,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useGameHistory } from '@/contexts/GameHistoryContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscriptionTier } = useAuth();
  const { history, allTimeStats, clearHistory, isLoading } = useGameHistory();
  const { t, language } = useLanguage();

  const isPremium = subscriptionTier !== 'free';
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  const topDescribers = useMemo(() => {
    return [...allTimeStats.playerLeaderboard].sort((a, b) => b.totalDescribed - a.totalDescribed).slice(0, 5);
  }, [allTimeStats.playerLeaderboard]);

  const topTabuCatchers = useMemo(() => {
    return [...allTimeStats.playerLeaderboard].sort((a, b) => b.totalTabu - a.totalTabu).slice(0, 5);
  }, [allTimeStats.playerLeaderboard]);

  const topScorers = useMemo(() => {
    return [...allTimeStats.playerLeaderboard].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  }, [allTimeStats.playerLeaderboard]);

  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.history.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.lockedContainer}>
          <View style={styles.lockIconWrap}>
            <Lock size={48} color={Colors.gold} />
          </View>
          <Text style={styles.lockedTitle}>{t.history.premiumFeature}</Text>
          <Text style={styles.lockedDesc}>{t.history.premiumDesc}</Text>
          <TouchableOpacity onPress={() => router.push('/subscription' as any)} activeOpacity={0.8}>
            <LinearGradient colors={[Colors.gold, '#E6B800']} style={styles.upgradeButton}>
              <Crown size={20} color="#1A1200" />
              <Text style={styles.upgradeButtonText}>{t.history.upgradeButton}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.history.title}</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={clearHistory} style={styles.backButton}>
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t.history.noHistory}</Text>
            <Text style={styles.emptyDesc}>{t.history.noHistoryDesc}</Text>
          </View>
        ) : (
          <>
            <View style={styles.overviewRow}>
              <View style={styles.overviewCard}>
                <LinearGradient colors={[Colors.primary + '20', Colors.primary + '08']} style={styles.overviewCardInner}>
                  <Trophy size={20} color={Colors.primary} />
                  <Text style={styles.overviewNumber}>{allTimeStats.totalGames}</Text>
                  <Text style={styles.overviewLabel}>{t.history.totalGames}</Text>
                </LinearGradient>
              </View>
              <View style={styles.overviewCard}>
                <LinearGradient colors={[Colors.teamA + '20', Colors.teamA + '08']} style={styles.overviewCardInner}>
                  <Target size={20} color={Colors.teamA} />
                  <Text style={styles.overviewNumber}>{allTimeStats.teamStats.A.wins}</Text>
                  <Text style={styles.overviewLabel}>{t.history.teamAWins}</Text>
                </LinearGradient>
              </View>
              <View style={styles.overviewCard}>
                <LinearGradient colors={[Colors.teamB + '20', Colors.teamB + '08']} style={styles.overviewCardInner}>
                  <Target size={20} color={Colors.teamB} />
                  <Text style={styles.overviewNumber}>{allTimeStats.teamStats.B.wins}</Text>
                  <Text style={styles.overviewLabel}>{t.history.teamBWins}</Text>
                </LinearGradient>
              </View>
            </View>

            {topScorers.length > 0 && (
              <View style={styles.leaderboardSection}>
                <View style={styles.sectionHeader}>
                  <Award size={18} color={Colors.gold} />
                  <Text style={styles.sectionTitle}>{t.history.scoreLeaderboard}</Text>
                </View>
                {topScorers.map((player, idx) => (
                  <View key={player.nickname + '_score'} style={styles.leaderRow}>
                    <View style={[styles.rankBadge, idx === 0 && { backgroundColor: Colors.gold + '25' }]}>
                      <Text style={[styles.rankText, idx === 0 && { color: Colors.gold }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.leaderName}>{player.nickname}</Text>
                    <Text style={styles.leaderStat}>{player.totalScore} {t.history.pointsSuffix}</Text>
                  </View>
                ))}
              </View>
            )}

            {topDescribers.length > 0 && (
              <View style={styles.leaderboardSection}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={18} color={Colors.success} />
                  <Text style={styles.sectionTitle}>{t.history.describeLeaderboard}</Text>
                </View>
                {topDescribers.map((player, idx) => (
                  <View key={player.nickname + '_desc'} style={styles.leaderRow}>
                    <View style={[styles.rankBadge, idx === 0 && { backgroundColor: Colors.success + '25' }]}>
                      <Text style={[styles.rankText, idx === 0 && { color: Colors.success }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.leaderName}>{player.nickname}</Text>
                    <Text style={styles.leaderStat}>{player.totalDescribed} {t.history.words}</Text>
                  </View>
                ))}
              </View>
            )}

            {topTabuCatchers.length > 0 && (
              <View style={styles.leaderboardSection}>
                <View style={styles.sectionHeader}>
                  <Zap size={18} color={Colors.error} />
                  <Text style={styles.sectionTitle}>{t.history.tabuLeaderboard}</Text>
                </View>
                {topTabuCatchers.map((player, idx) => (
                  <View key={player.nickname + '_tabu'} style={styles.leaderRow}>
                    <View style={[styles.rankBadge, idx === 0 && { backgroundColor: Colors.error + '25' }]}>
                      <Text style={[styles.rankText, idx === 0 && { color: Colors.error }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.leaderName}>{player.nickname}</Text>
                    <Text style={styles.leaderStat}>{player.totalTabu} {t.history.tabuSuffix}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.gamesListTitle}>{t.history.gameHistory}</Text>

            {history.map((game) => {
              const winnerLabel = game.winner === 'A' ? t.game.teamA : game.winner === 'B' ? t.game.teamB : t.history.draw;
              const winnerColor = game.winner === 'A' ? Colors.teamA : game.winner === 'B' ? Colors.teamB : Colors.secondary;
              const gameDate = new Date(game.date);
              const dateStr = gameDate.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });
              const timeStr = gameDate.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

              return (
                <TouchableOpacity
                  key={game.id}
                  onPress={() => router.push(`/history-detail?id=${game.id}` as any)}
                  activeOpacity={0.7}
                  style={styles.gameCard}
                >
                  <LinearGradient colors={[Colors.surface, Colors.card]} style={styles.gameCardInner}>
                    <View style={styles.gameCardTop}>
                      <View style={styles.gameCardDate}>
                        <Clock size={12} color={Colors.textMuted} />
                        <Text style={styles.gameDateText}>{dateStr} {timeStr}</Text>
                      </View>
                      <View style={[styles.winnerChip, { backgroundColor: winnerColor + '20' }]}>
                        <Text style={[styles.winnerChipText, { color: winnerColor }]}>
                          {game.winner ? `${winnerLabel} ${t.history.won}` : t.history.draw}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.gameScoreRow}>
                      <View style={styles.gameTeamCol}>
                        <Text style={[styles.gameTeamName, { color: Colors.teamA }]}>{t.game.teamA}</Text>
                        <Text style={styles.gameTeamMembers}>{game.teamAPlayers.join(', ')}</Text>
                      </View>
                      <View style={styles.gameScoreCenter}>
                        <Text style={styles.gameScoreText}>{game.scores.A} - {game.scores.B}</Text>
                      </View>
                      <View style={[styles.gameTeamCol, { alignItems: 'flex-end' as const }]}>
                        <Text style={[styles.gameTeamName, { color: Colors.teamB }]}>{t.game.teamB}</Text>
                        <Text style={[styles.gameTeamMembers, { textAlign: 'right' as const }]}>{game.teamBPlayers.join(', ')}</Text>
                      </View>
                    </View>

                    <View style={styles.gameCardBottom}>
                      <View style={styles.gameMetaRow}>
                        <Text style={styles.gameMetaText}>
                          {t.difficulties[game.settings.difficulty]} · {t.ageGroups[game.settings.ageGroup]} · {game.rounds} {t.history.rounds}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={Colors.textMuted} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center' as const, alignItems: 'center' as const },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  lockedContainer: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, paddingHorizontal: 40, gap: 16 },
  lockIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.gold + '12', justifyContent: 'center' as const, alignItems: 'center' as const, marginBottom: 8 },
  lockedTitle: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  lockedDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' as const, lineHeight: 22 },
  upgradeButton: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  upgradeButtonText: { fontSize: 16, fontWeight: '800' as const, color: '#1A1200' },
  emptyState: { alignItems: 'center' as const, paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary },
  overviewRow: { flexDirection: 'row' as const, gap: 10, marginBottom: 24 },
  overviewCard: { flex: 1, borderRadius: 14, overflow: 'hidden' as const },
  overviewCardInner: { alignItems: 'center' as const, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  overviewNumber: { fontSize: 24, fontWeight: '900' as const, color: Colors.text },
  overviewLabel: { fontSize: 10, fontWeight: '600' as const, color: Colors.textSecondary, textAlign: 'center' as const },
  leaderboardSection: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  leaderRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 8, gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.surfaceLight, justifyContent: 'center' as const, alignItems: 'center' as const },
  rankText: { fontSize: 13, fontWeight: '700' as const, color: Colors.textSecondary },
  leaderName: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  leaderStat: { fontSize: 13, fontWeight: '700' as const, color: Colors.textSecondary },
  gamesListTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 14, marginTop: 8 },
  gameCard: { borderRadius: 16, overflow: 'hidden' as const, marginBottom: 12 },
  gameCardInner: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  gameCardTop: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 12 },
  gameCardDate: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  gameDateText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' as const },
  winnerChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  winnerChipText: { fontSize: 11, fontWeight: '700' as const },
  gameScoreRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 12 },
  gameTeamCol: { flex: 1 },
  gameTeamName: { fontSize: 12, fontWeight: '700' as const, marginBottom: 2 },
  gameTeamMembers: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' as const },
  gameScoreCenter: { paddingHorizontal: 16 },
  gameScoreText: { fontSize: 22, fontWeight: '900' as const, color: Colors.text },
  gameCardBottom: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  gameMetaRow: { flex: 1 },
  gameMetaText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' as const },
});
