import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Trophy,
  Clock,
  Check,
  X,
  Crown,
  Star,
  Bell,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useGameHistory } from '@/contexts/GameHistoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FORBIDDEN_COUNT } from '@/types/game';

export default function HistoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history } = useGameHistory();
  const { t, language } = useLanguage();

  const game = useMemo(() => history.find((g) => g.id === id), [history, id]);
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  if (!game) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.historyDetail.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.historyDetail.gameNotFound}</Text>
        </View>
      </View>
    );
  }

  const winnerLabel = game.winner === 'A' ? t.game.teamA : game.winner === 'B' ? t.game.teamB : '';
  const winnerColor = game.winner === 'A' ? Colors.teamA : game.winner === 'B' ? Colors.teamB : Colors.secondary;
  const gameDate = new Date(game.date);
  const dateStr = gameDate.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = gameDate.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

  const teamAStats = game.playerStats.filter((p) => p.team === 'A');
  const teamBStats = game.playerStats.filter((p) => p.team === 'B');

  const topDescriber = [...game.playerStats].sort((a, b) => b.wordsDescribed - a.wordsDescribed)[0];
  const topScorer = [...game.playerStats].sort((a, b) => b.score - a.score)[0];
  const topTabuCatcher = [...game.playerStats].sort((a, b) => b.tabuCatches - a.tabuCatches)[0];

  const forbiddenCount = FORBIDDEN_COUNT[game.settings.difficulty];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.historyDetail.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateRow}>
          <Clock size={14} color={Colors.textMuted} />
          <Text style={styles.dateText}>{dateStr} · {timeStr}</Text>
        </View>

        <View style={styles.resultCard}>
          <LinearGradient
            colors={[winnerColor + '18', winnerColor + '06']}
            style={styles.resultCardInner}
          >
            <View style={styles.resultHeader}>
              <Trophy size={24} color={winnerColor} />
              <Text style={[styles.resultTitle, { color: winnerColor }]}>
                {game.winner ? `${winnerLabel} ${t.results.won}` : t.results.draw}
              </Text>
            </View>

            <View style={styles.scoreDisplay}>
              <View style={styles.scoreTeam}>
                <Text style={[styles.scoreTeamLabel, { color: Colors.teamA }]}>{t.game.teamA}</Text>
                <Text style={[styles.bigScore, game.winner === 'A' && { color: Colors.teamA }]}>
                  {game.scores.A}
                </Text>
              </View>
              <Text style={styles.scoreDash}>—</Text>
              <View style={styles.scoreTeam}>
                <Text style={[styles.scoreTeamLabel, { color: Colors.teamB }]}>{t.game.teamB}</Text>
                <Text style={[styles.bigScore, game.winner === 'B' && { color: Colors.teamB }]}>
                  {game.scores.B}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingChip}>
            <Text style={styles.settingChipText}>{t.difficulties[game.settings.difficulty]}</Text>
          </View>
          <View style={styles.settingChip}>
            <Text style={styles.settingChipText}>{t.ageGroups[game.settings.ageGroup]}</Text>
          </View>
          <View style={styles.settingChip}>
            <Text style={styles.settingChipText}>{game.rounds} {t.history.rounds}</Text>
          </View>
          <View style={styles.settingChip}>
            <Text style={styles.settingChipText}>{forbiddenCount} {t.historyDetail.forbidden}</Text>
          </View>
        </View>

        {topScorer && topScorer.score > 0 && (
          <View style={styles.mvpSection}>
            <Text style={styles.mvpSectionTitle}>{t.historyDetail.mvpAwards}</Text>
            <View style={styles.mvpRow}>
              {topScorer.score > 0 && (
                <View style={styles.mvpItem}>
                  <LinearGradient colors={[Colors.gold + '15', Colors.gold + '05']} style={styles.mvpItemInner}>
                    <Crown size={18} color={Colors.gold} />
                    <Text style={styles.mvpItemLabel}>{t.historyDetail.highestScore}</Text>
                    <Text style={styles.mvpItemName}>{topScorer.nickname}</Text>
                    <Text style={[styles.mvpItemStat, { color: Colors.gold }]}>{topScorer.score}</Text>
                  </LinearGradient>
                </View>
              )}
              {topDescriber && topDescriber.wordsDescribed > 0 && (
                <View style={styles.mvpItem}>
                  <LinearGradient colors={[Colors.success + '15', Colors.success + '05']} style={styles.mvpItemInner}>
                    <Star size={18} color={Colors.success} />
                    <Text style={styles.mvpItemLabel}>{t.historyDetail.mostDescribed}</Text>
                    <Text style={styles.mvpItemName}>{topDescriber.nickname}</Text>
                    <Text style={[styles.mvpItemStat, { color: Colors.success }]}>{topDescriber.wordsDescribed}</Text>
                  </LinearGradient>
                </View>
              )}
              {topTabuCatcher && topTabuCatcher.tabuCatches > 0 && (
                <View style={styles.mvpItem}>
                  <LinearGradient colors={[Colors.error + '15', Colors.error + '05']} style={styles.mvpItemInner}>
                    <Bell size={18} color={Colors.error} />
                    <Text style={styles.mvpItemLabel}>{t.historyDetail.tabuHunter}</Text>
                    <Text style={styles.mvpItemName}>{topTabuCatcher.nickname}</Text>
                    <Text style={[styles.mvpItemStat, { color: Colors.error }]}>{topTabuCatcher.tabuCatches}</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            <View style={[styles.teamDot, { backgroundColor: Colors.teamA }]} />
            <Text style={[styles.teamTitle, { color: Colors.teamA }]}>{t.game.teamA}</Text>
            <Text style={styles.teamScoreSmall}>{game.scores.A} {t.historyDetail.pointsSuffix}</Text>
          </View>
          {teamAStats.map((player) => (
            <View key={player.playerId} style={styles.playerStatRow}>
              <Text style={styles.playerName}>{player.nickname}</Text>
              <View style={styles.playerStatCols}>
                <View style={styles.playerStatCol}>
                  <Check size={12} color={Colors.success} />
                  <Text style={styles.playerStatValue}>{player.wordsDescribed}</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <X size={12} color={Colors.error} />
                  <Text style={styles.playerStatValue}>{player.tabuCatches}</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <Trophy size={12} color={Colors.gold} />
                  <Text style={styles.playerStatValue}>{player.score}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            <View style={[styles.teamDot, { backgroundColor: Colors.teamB }]} />
            <Text style={[styles.teamTitle, { color: Colors.teamB }]}>{t.game.teamB}</Text>
            <Text style={styles.teamScoreSmall}>{game.scores.B} {t.historyDetail.pointsSuffix}</Text>
          </View>
          {teamBStats.map((player) => (
            <View key={player.playerId} style={styles.playerStatRow}>
              <Text style={styles.playerName}>{player.nickname}</Text>
              <View style={styles.playerStatCols}>
                <View style={styles.playerStatCol}>
                  <Check size={12} color={Colors.success} />
                  <Text style={styles.playerStatValue}>{player.wordsDescribed}</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <X size={12} color={Colors.error} />
                  <Text style={styles.playerStatValue}>{player.tabuCatches}</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <Trophy size={12} color={Colors.gold} />
                  <Text style={styles.playerStatValue}>{player.score}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statsLegend}>
          <View style={styles.legendItem}>
            <Check size={12} color={Colors.success} />
            <Text style={styles.legendText}>{t.historyDetail.correctDesc}</Text>
          </View>
          <View style={styles.legendItem}>
            <X size={12} color={Colors.error} />
            <Text style={styles.legendText}>{t.historyDetail.tabuCatch}</Text>
          </View>
          <View style={styles.legendItem}>
            <Trophy size={12} color={Colors.gold} />
            <Text style={styles.legendText}>{t.historyDetail.totalScore}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center' as const, alignItems: 'center' as const },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 16, justifyContent: 'center' as const },
  dateText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' as const },
  resultCard: { borderRadius: 20, overflow: 'hidden' as const, marginBottom: 16 },
  resultCardInner: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' as const, gap: 16 },
  resultHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  resultTitle: { fontSize: 22, fontWeight: '900' as const },
  scoreDisplay: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreTeam: { flex: 1, alignItems: 'center' as const, gap: 4 },
  scoreTeamLabel: { fontSize: 13, fontWeight: '700' as const },
  bigScore: { fontSize: 44, fontWeight: '900' as const, color: Colors.text },
  scoreDash: { fontSize: 22, color: Colors.textMuted, paddingHorizontal: 16 },
  settingsRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, marginBottom: 20, justifyContent: 'center' as const },
  settingChip: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  settingChipText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  mvpSection: { marginBottom: 20 },
  mvpSectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  mvpRow: { flexDirection: 'row' as const, gap: 10 },
  mvpItem: { flex: 1, borderRadius: 14, overflow: 'hidden' as const },
  mvpItemInner: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' as const, gap: 6 },
  mvpItemLabel: { fontSize: 10, fontWeight: '600' as const, color: Colors.textSecondary, textAlign: 'center' as const },
  mvpItemName: { fontSize: 13, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' as const },
  mvpItemStat: { fontSize: 20, fontWeight: '900' as const },
  teamSection: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  teamHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  teamTitle: { fontSize: 16, fontWeight: '700' as const, flex: 1 },
  teamScoreSmall: { fontSize: 14, fontWeight: '700' as const, color: Colors.textSecondary },
  playerStatRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border + '50' },
  playerName: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  playerStatCols: { flexDirection: 'row' as const, gap: 16 },
  playerStatCol: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, minWidth: 36, justifyContent: 'center' as const },
  playerStatValue: { fontSize: 14, fontWeight: '700' as const, color: Colors.textSecondary },
  statsLegend: { flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 20, marginTop: 4, paddingVertical: 12 },
  legendItem: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  legendText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' as const },
});
