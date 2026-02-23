import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import * as Haptics from 'expo-haptics';
import {
  Check,
  X,
  SkipForward,
  Bell,
  Timer,
  Trophy,
  LogOut,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { Colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordCard } from '@/types/game';

const { width } = Dimensions.get('window');

type TurnPhase = 'ready' | 'countdown' | 'playing' | 'turnEnd';

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    gameState,
    getCurrentDescriber,
    getNextCard,
    recordCorrect,
    recordTabu,
    endTurn,
    settings,
    resetGame,
  } = useGame();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<TurnPhase>('ready');
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(settings.turnDuration);
  const [currentCard, setCurrentCard] = useState<WordCard | null>(null);
  const [passesUsed, setPassesUsed] = useState<number>(0);
  const [turnCorrect, setTurnCorrect] = useState<number>(0);
  const [turnTabu, setTurnTabu] = useState<number>(0);
  const [turnPassed, setTurnPassed] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const successFlash = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(0.5)).current;

  const describer = getCurrentDescriber();

  useEffect(() => {
    if (!gameState || gameState.isGameOver) {
      router.replace('/results' as any);
    }
  }, [gameState?.isGameOver]);

  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    setPassesUsed(0);
    setTurnCorrect(0);
    setTurnTabu(0);
    setTurnPassed(0);
    setTimeLeft(settings.turnDuration);
  }, [settings.turnDuration]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      const card = getNextCard();
      setCurrentCard(card);
      animateCardIn();
      return;
    }

    countdownScale.setValue(0.5);
    Animated.spring(countdownScale, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();

    const tm = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(tm);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPhase('turnEnd');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 10 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft, phase]);

  const animateCardIn = useCallback(() => {
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  const nextCard = useCallback(() => {
    const card = getNextCard();
    setCurrentCard(card);
    animateCardIn();
  }, [getNextCard, animateCardIn]);

  const handleCorrect = useCallback(() => {
    recordCorrect();
    setTurnCorrect((c) => c + 1);

    successFlash.setValue(1);
    Animated.timing(successFlash, { toValue: 0, duration: 400, useNativeDriver: true }).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (gameState && gameState.scores[gameState.currentTeam] + 1 >= gameState.settings.targetScore) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('turnEnd');
      return;
    }

    nextCard();
  }, [recordCorrect, nextCard, gameState, successFlash]);

  const handleTabu = useCallback(() => {
    recordTabu();
    setTurnTabu((tb) => tb + 1);

    flashOpacity.setValue(1);
    Animated.timing(flashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    nextCard();
  }, [recordTabu, nextCard, shakeAnim, flashOpacity]);

  const handlePass = useCallback(() => {
    if (passesUsed >= settings.passLimit) return;
    setPassesUsed((p) => p + 1);
    setTurnPassed((p) => p + 1);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    nextCard();
  }, [passesUsed, settings.passLimit, nextCard]);

  const handleEndTurn = useCallback(() => {
    endTurn();
    setPhase('ready');
  }, [endTurn]);

  const handleGoResults = useCallback(() => {
    router.replace('/results' as any);
  }, [router]);

  const handleExitGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    Alert.alert(
      t.game.exitGame,
      t.game.exitConfirm,
      [
        { text: t.game.continueGame, style: 'cancel', onPress: () => {
          if (phase === 'playing') {
            timerRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                if (prev <= 1) {
                  clearInterval(timerRef.current!);
                  setPhase('turnEnd');
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }},
        { text: t.game.exit, style: 'destructive', onPress: () => {
          resetGame();
          router.replace('/');
        }},
      ]
    );
  }, [phase, resetGame, router, t]);

  if (!gameState || !describer) return null;

  const currentTeam = gameState.currentTeam;
  const teamColor = currentTeam === 'A' ? Colors.teamA : Colors.teamB;
  const teamName = currentTeam === 'A' ? t.game.teamA : t.game.teamB;
  const timerColor = timeLeft <= 10 ? Colors.error : timeLeft <= 20 ? Colors.warning : Colors.text;
  const timerProgress = timeLeft / settings.turnDuration;

  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const cardOpacity = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  if (phase === 'ready') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.readyContent}>
          <View style={styles.readyHeader}>
            <TouchableOpacity onPress={handleExitGame} style={styles.exitButton} testID="exit-ready-button">
              <LogOut size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.scoreBar}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreTeam, { color: Colors.teamA }]}>{t.game.teamA}</Text>
              <Text style={styles.scoreValue}>{gameState.scores.A}</Text>
            </View>
            <View style={styles.scoreDivider}>
              <Trophy size={18} color={Colors.secondary} />
              <Text style={styles.targetText}>{settings.targetScore}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreTeam, { color: Colors.teamB }]}>{t.game.teamB}</Text>
              <Text style={styles.scoreValue}>{gameState.scores.B}</Text>
            </View>
          </View>

          <View style={styles.readyCenter}>
            <Text style={styles.roundText}>{t.game.round} {gameState.round}</Text>
            <View style={[styles.teamBadge, { backgroundColor: teamColor }]}>
              <Text style={styles.teamBadgeText}>{teamName}</Text>
            </View>
            <Text style={styles.describerLabel}>{t.game.describer}</Text>
            <Text style={styles.describerName}>{describer.nickname}</Text>
            <Text style={styles.readyHint}>{t.game.readyHint}</Text>
          </View>

          <TouchableOpacity onPress={startCountdown} activeOpacity={0.8} testID="ready-button">
            <LinearGradient colors={[teamColor, teamColor + 'CC']} style={styles.readyButton}>
              <Text style={styles.readyButtonText}>{t.game.ready}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'countdown') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.countdownCenter}>
          <Animated.Text style={[styles.countdownNumber, { transform: [{ scale: countdownScale }] }]}>
            {countdown}
          </Animated.Text>
          <Text style={styles.countdownLabel}>{t.game.getReady}</Text>
        </View>
      </View>
    );
  }

  if (phase === 'turnEnd') {
    const isGameOver = gameState.isGameOver;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />
        <View style={styles.turnEndContent}>
          <Text style={styles.turnEndTitle}>
            {isGameOver ? t.game.gameOver : t.game.timeUp}
          </Text>

          <View style={styles.turnStats}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                <Check size={20} color={Colors.success} />
              </View>
              <Text style={styles.statNumber}>{turnCorrect}</Text>
              <Text style={styles.statLabel}>{t.game.correct}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,71,87,0.15)' }]}>
                <X size={20} color={Colors.error} />
              </View>
              <Text style={styles.statNumber}>{turnTabu}</Text>
              <Text style={styles.statLabel}>{t.game.tabu}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,183,77,0.15)' }]}>
                <SkipForward size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statNumber}>{turnPassed}</Text>
              <Text style={styles.statLabel}>{t.game.pass}</Text>
            </View>
          </View>

          <View style={styles.scoreBar}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreTeam, { color: Colors.teamA }]}>{t.game.teamA}</Text>
              <Text style={styles.scoreValue}>{gameState.scores.A}</Text>
            </View>
            <View style={styles.scoreDivider}>
              <Trophy size={18} color={Colors.secondary} />
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreTeam, { color: Colors.teamB }]}>{t.game.teamB}</Text>
              <Text style={styles.scoreValue}>{gameState.scores.B}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={isGameOver ? handleGoResults : handleEndTurn} activeOpacity={0.8}>
            <LinearGradient colors={[Colors.primary, '#FF8A65']} style={styles.readyButton}>
              <Text style={styles.readyButtonText}>
                {isGameOver ? t.game.seeResults : t.game.nextTurn}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.flashOverlay, styles.tabuFlash, { opacity: flashOpacity }]} pointerEvents="none" />
      <Animated.View style={[styles.flashOverlay, styles.successFlashOverlay, { opacity: successFlash }]} pointerEvents="none" />

      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={handleExitGame} style={styles.exitButton} testID="exit-game-button">
          <LogOut size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.teamIndicator}>
          <View style={[styles.teamDot, { backgroundColor: teamColor }]} />
          <Text style={[styles.teamLabel, { color: teamColor }]}>{teamName}</Text>
        </View>

        <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Timer size={16} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
        </Animated.View>

        <View style={styles.scoreSmall}>
          <Text style={styles.scoreSmallText}>{gameState.scores.A} - {gameState.scores.B}</Text>
        </View>
      </View>

      <View style={styles.timerBar}>
        <View style={[styles.timerBarFill, { width: `${timerProgress * 100}%`, backgroundColor: timerColor }]} />
      </View>

      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [{ scale: cardScale }, { translateX: shakeAnim }], opacity: cardOpacity },
        ]}
      >
        {currentCard ? (
          <View style={styles.card}>
            <LinearGradient colors={[Colors.surface, Colors.card]} style={styles.cardGradient}>
              <Text style={styles.mainWord}>{currentCard.word}</Text>
              <View style={styles.divider} />
              <Text style={styles.forbiddenTitle}>{t.game.forbiddenWords}</Text>
              <View style={styles.forbiddenList}>
                {currentCard.forbidden.map((word, idx) => (
                  <View key={idx} style={styles.forbiddenItem}>
                    <X size={12} color={Colors.error} />
                    <Text style={styles.forbiddenWord}>{word}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.card}>
            <LinearGradient colors={[Colors.surface, Colors.card]} style={styles.cardGradient}>
              <Text style={styles.mainWord}>{t.game.noCards}</Text>
              <Text style={[styles.forbiddenTitle, { color: Colors.textMuted }]}>{t.game.noCardsHint}</Text>
            </LinearGradient>
          </View>
        )}
      </Animated.View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleTabu} style={styles.tabuButton} activeOpacity={0.7} testID="tabu-button">
          <LinearGradient colors={[Colors.error, '#FF6B7A']} style={styles.tabuButtonInner}>
            <Bell size={22} color="#FFF" />
            <Text style={styles.tabuButtonText}>TABU!</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handlePass}
            disabled={passesUsed >= settings.passLimit}
            style={[styles.actionButton, styles.passButton, passesUsed >= settings.passLimit && styles.actionButtonDisabled]}
            activeOpacity={0.7}
            testID="pass-button"
          >
            <SkipForward size={20} color={passesUsed >= settings.passLimit ? Colors.textMuted : Colors.secondary} />
            <Text style={[styles.actionButtonText, { color: passesUsed >= settings.passLimit ? Colors.textMuted : Colors.secondary }]}>
              {t.game.pass} ({settings.passLimit - passesUsed})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCorrect} style={[styles.actionButton, styles.correctButton]} activeOpacity={0.7} testID="correct-button">
            <LinearGradient colors={[Colors.success, '#6BE89A']} style={styles.correctButtonInner}>
              <Check size={22} color="#FFF" />
              <Text style={styles.correctButtonText}>{t.game.correct}!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flashOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  tabuFlash: { backgroundColor: 'rgba(255, 71, 87, 0.3)' },
  successFlashOverlay: { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
  readyHeader: { flexDirection: 'row', justifyContent: 'flex-start' },
  readyContent: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20 },
  readyCenter: { alignItems: 'center', gap: 12 },
  roundText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2 },
  teamBadge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  teamBadgeText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  describerLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 12 },
  describerName: { fontSize: 36, fontWeight: '900', color: Colors.text },
  readyHint: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: 8 },
  readyButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  readyButtonText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  countdownCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  countdownNumber: { fontSize: 120, fontWeight: '900', color: Colors.primary },
  countdownLabel: { fontSize: 20, color: Colors.textSecondary, marginTop: 8 },
  turnEndContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 32 },
  turnEndTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  turnStats: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  statItem: { alignItems: 'center', gap: 8 },
  statIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  scoreBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  scoreItem: { flex: 1, alignItems: 'center', gap: 4 },
  scoreTeam: { fontSize: 13, fontWeight: '700' },
  scoreValue: { fontSize: 32, fontWeight: '900', color: Colors.text },
  scoreDivider: { alignItems: 'center', gap: 4, paddingHorizontal: 16 },
  targetText: { fontSize: 11, color: Colors.textMuted },
  exitButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  teamIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  teamLabel: { fontSize: 14, fontWeight: '700' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  timerText: { fontSize: 18, fontWeight: '800' },
  scoreSmall: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  scoreSmallText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  timerBar: { height: 3, backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: 2 },
  cardContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  card: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  cardGradient: { padding: 28, alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  mainWord: { fontSize: 36, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 20 },
  divider: { width: 60, height: 3, backgroundColor: Colors.primary, borderRadius: 2, marginBottom: 20 },
  forbiddenTitle: { fontSize: 12, fontWeight: '700', color: Colors.error, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 },
  forbiddenList: { gap: 10, width: '100%' },
  forbiddenItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255, 71, 87, 0.08)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  forbiddenWord: { fontSize: 17, fontWeight: '600', color: Colors.text },
  actionsContainer: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  tabuButton: { borderRadius: 14, overflow: 'hidden' },
  tabuButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, borderRadius: 14 },
  tabuButtonText: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  passButton: { backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', paddingVertical: 14, gap: 8, borderWidth: 1, borderColor: Colors.border },
  actionButtonDisabled: { opacity: 0.4 },
  actionButtonText: { fontSize: 15, fontWeight: '700' },
  correctButton: { flex: 2 },
  correctButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, borderRadius: 14 },
  correctButtonText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
});
