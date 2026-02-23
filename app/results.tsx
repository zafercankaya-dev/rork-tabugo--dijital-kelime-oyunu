import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Trophy,
  Crown,
  Home,
  RotateCcw,
  Star,
  Bell,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useGameHistory } from '@/contexts/GameHistoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameState, resetGame } = useGame();
  const { saveGame } = useGameHistory();
  const { subscriptionTier } = useAuth();
  const { t } = useLanguage();
  const hasSaved = useRef(false);

  useEffect(() => {
    if (gameState && !hasSaved.current && subscriptionTier !== 'free') {
      hasSaved.current = true;
      saveGame(gameState);
      console.log('[Results] Game saved to history');
    }
  }, [gameState, subscriptionTier, saveGame]);

  const confettiAnim = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(trophyScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(confettiAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!gameState) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.results.noResults}</Text>
          <TouchableOpacity onPress={() => { resetGame(); router.replace('/'); }}>
            <LinearGradient colors={[Colors.primary, '#FF8A65']} style={styles.homeButton}>
              <Home size={18} color="#FFF" />
              <Text style={styles.homeButtonText}>{t.results.homePage}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const winner = gameState.scores.A > gameState.scores.B ? 'A' : gameState.scores.B > gameState.scores.A ? 'B' : null;
  const winnerColor = winner === 'A' ? Colors.teamA : winner === 'B' ? Colors.teamB : Colors.secondary;
  const winnerName = winner === 'A' ? t.game.teamA : winner === 'B' ? t.game.teamB : '';

  const allPlayers = gameState.players;
  const topDescriber = [...allPlayers].sort((a, b) => b.wordsDescribed - a.wordsDescribed)[0];
  const topTabuCatcher = [...allPlayers].sort((a, b) => b.tabuCatches - a.tabuCatches)[0];
  const topScorer = [...allPlayers].sort((a, b) => b.score - a.score)[0];

  const confettiRotate = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.trophySection, { transform: [{ scale: trophyScale }, { rotateZ: confettiRotate }] }]}>
          <LinearGradient
            colors={[winnerColor + '30', winnerColor + '10']}
            style={styles.trophyBg}
          >
            <Crown size={60} color={winnerColor} fill={winnerColor} />
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.winnerTitle, { color: winnerColor }]}>
          {winner ? `${winnerName} ${t.results.won}` : t.results.draw}
        </Text>

        <View style={styles.finalScore}>
          <View style={styles.finalScoreItem}>
            <Text style={[styles.finalScoreTeam, { color: Colors.teamA }]}>{t.game.teamA}</Text>
            <Text style={[styles.finalScoreNumber, gameState.scores.A > gameState.scores.B && { color: Colors.teamA }]}>
              {gameState.scores.A}
            </Text>
          </View>
          <Text style={styles.finalScoreDash}>—</Text>
          <View style={styles.finalScoreItem}>
            <Text style={[styles.finalScoreTeam, { color: Colors.teamB }]}>{t.game.teamB}</Text>
            <Text style={[styles.finalScoreNumber, gameState.scores.B > gameState.scores.A && { color: Colors.teamB }]}>
              {gameState.scores.B}
            </Text>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.mvpTitle}>{t.results.mvpAwards}</Text>

          <View style={styles.mvpList}>
            {topScorer && topScorer.score > 0 && (
              <View style={styles.mvpCard}>
                <LinearGradient colors={['rgba(255, 215, 0, 0.12)', 'rgba(255, 215, 0, 0.04)']} style={styles.mvpCardGradient}>
                  <View style={[styles.mvpIcon, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                    <Trophy size={22} color={Colors.gold} />
                  </View>
                  <View style={styles.mvpInfo}>
                    <Text style={styles.mvpAward}>{t.results.highestScore}</Text>
                    <Text style={styles.mvpName}>{topScorer.nickname}</Text>
                  </View>
                  <Text style={[styles.mvpStat, { color: Colors.gold }]}>{topScorer.score}</Text>
                </LinearGradient>
              </View>
            )}

            {topDescriber && topDescriber.wordsDescribed > 0 && (
              <View style={styles.mvpCard}>
                <LinearGradient colors={['rgba(74, 222, 128, 0.12)', 'rgba(74, 222, 128, 0.04)']} style={styles.mvpCardGradient}>
                  <View style={[styles.mvpIcon, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                    <Star size={22} color={Colors.success} />
                  </View>
                  <View style={styles.mvpInfo}>
                    <Text style={styles.mvpAward}>{t.results.mostDescribed}</Text>
                    <Text style={styles.mvpName}>{topDescriber.nickname}</Text>
                  </View>
                  <Text style={[styles.mvpStat, { color: Colors.success }]}>{topDescriber.wordsDescribed}</Text>
                </LinearGradient>
              </View>
            )}

            {topTabuCatcher && topTabuCatcher.tabuCatches > 0 && (
              <View style={styles.mvpCard}>
                <LinearGradient colors={['rgba(255, 71, 87, 0.12)', 'rgba(255, 71, 87, 0.04)']} style={styles.mvpCardGradient}>
                  <View style={[styles.mvpIcon, { backgroundColor: 'rgba(255, 71, 87, 0.2)' }]}>
                    <Bell size={22} color={Colors.error} />
                  </View>
                  <View style={styles.mvpInfo}>
                    <Text style={styles.mvpAward}>{t.results.tabuHunter}</Text>
                    <Text style={styles.mvpName}>{topTabuCatcher.nickname}</Text>
                  </View>
                  <Text style={[styles.mvpStat, { color: Colors.error }]}>{topTabuCatcher.tabuCatches}</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          <Text style={styles.allPlayersTitle}>{t.results.allPlayers}</Text>

          {[...allPlayers]
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerRank}>
                  <Text style={styles.playerRankText}>{index + 1}</Text>
                </View>
                <View style={[styles.playerDot, { backgroundColor: player.team === 'A' ? Colors.teamA : Colors.teamB }]} />
                <Text style={styles.playerRowName}>{player.nickname}</Text>
                <Text style={styles.playerRowScore}>{player.score} {t.results.pointsSuffix}</Text>
              </View>
            ))}
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            onPress={() => { resetGame(); router.replace('/'); }}
            style={styles.bottomBtnSecondary}
            activeOpacity={0.7}
          >
            <Home size={18} color={Colors.textSecondary} />
            <Text style={styles.bottomBtnSecondaryText}>{t.results.homePage}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { resetGame(); router.replace('/setup' as any); }}
            activeOpacity={0.8}
            style={styles.bottomBtnPrimary}
          >
            <LinearGradient colors={[Colors.primary, '#FF8A65']} style={styles.bottomBtnPrimaryInner}>
              <RotateCcw size={18} color="#FFF" />
              <Text style={styles.bottomBtnPrimaryText}>{t.results.newGame}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  homeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  homeButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  trophySection: { alignItems: 'center', marginBottom: 16 },
  trophyBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  winnerTitle: { fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  finalScore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  finalScoreItem: { flex: 1, alignItems: 'center', gap: 6 },
  finalScoreTeam: { fontSize: 14, fontWeight: '700' },
  finalScoreNumber: { fontSize: 48, fontWeight: '900', color: Colors.text },
  finalScoreDash: { fontSize: 24, color: Colors.textMuted, paddingHorizontal: 16 },
  mvpTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  mvpList: { gap: 10, marginBottom: 28 },
  mvpCard: { borderRadius: 16, overflow: 'hidden' },
  mvpCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  mvpIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mvpInfo: { flex: 1 },
  mvpAward: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  mvpName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  mvpStat: { fontSize: 24, fontWeight: '900' },
  allPlayersTitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  playerRank: { width: 24, height: 24, borderRadius: 8, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  playerRankText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  playerDot: { width: 8, height: 8, borderRadius: 4 },
  playerRowName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  playerRowScore: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  bottomButtons: { flexDirection: 'row', gap: 10 },
  bottomBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  bottomBtnSecondaryText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  bottomBtnPrimary: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  bottomBtnPrimaryInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  bottomBtnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
