import React, { useRef, useEffect } from 'react';
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
import {
  ChevronLeft,
  ArrowLeftRight,
  Trash2,
  Play,
  Shield,
  Swords,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LobbyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { teamA, teamB, switchTeam, removePlayer, startGame, players } = useGame();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const canStart = teamA.length >= 2 && teamB.length >= 2;

  const handleStart = () => {
    startGame();
    router.push('/game' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E21', '#121837', '#0A0E21']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.lobby.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.teamsRow}>
            <View style={styles.teamColumn}>
              <LinearGradient
                colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.05)']}
                style={styles.teamHeader}
              >
                <Shield size={20} color={Colors.teamA} />
                <Text style={[styles.teamName, { color: Colors.teamA }]}>{t.lobby.teamA}</Text>
                <View style={[styles.teamCount, { backgroundColor: Colors.teamA }]}>
                  <Text style={styles.teamCountText}>{teamA.length}</Text>
                </View>
              </LinearGradient>
              {teamA.map((player) => (
                <View key={player.id} style={styles.playerCard}>
                  <Text style={styles.playerName} numberOfLines={1}>{player.nickname}</Text>
                  <View style={styles.playerActions}>
                    <TouchableOpacity onPress={() => switchTeam(player.id)} style={styles.actionBtn}>
                      <ArrowLeftRight size={14} color={Colors.teamB} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removePlayer(player.id)} style={styles.actionBtn}>
                      <Trash2 size={14} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {teamA.length < 2 && <Text style={styles.teamHint}>{t.lobby.minPlayers}</Text>}
            </View>

            <View style={styles.vsContainer}>
              <Swords size={20} color={Colors.textMuted} />
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamColumn}>
              <LinearGradient
                colors={['rgba(249,115,22,0.15)', 'rgba(249,115,22,0.05)']}
                style={styles.teamHeader}
              >
                <Shield size={20} color={Colors.teamB} />
                <Text style={[styles.teamName, { color: Colors.teamB }]}>{t.lobby.teamB}</Text>
                <View style={[styles.teamCount, { backgroundColor: Colors.teamB }]}>
                  <Text style={styles.teamCountText}>{teamB.length}</Text>
                </View>
              </LinearGradient>
              {teamB.map((player) => (
                <View key={player.id} style={styles.playerCard}>
                  <Text style={styles.playerName} numberOfLines={1}>{player.nickname}</Text>
                  <View style={styles.playerActions}>
                    <TouchableOpacity onPress={() => switchTeam(player.id)} style={styles.actionBtn}>
                      <ArrowLeftRight size={14} color={Colors.teamA} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removePlayer(player.id)} style={styles.actionBtn}>
                      <Trash2 size={14} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {teamB.length < 2 && <Text style={styles.teamHint}>{t.lobby.minPlayers}</Text>}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t.lobby.info}</Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity onPress={handleStart} disabled={!canStart} activeOpacity={0.8} testID="start-game-button">
            <LinearGradient
              colors={canStart ? [Colors.primary, '#FF8A65'] : [Colors.surface, Colors.surface]}
              style={[styles.startButton, !canStart && styles.startButtonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Play size={22} color={canStart ? '#FFF' : Colors.textMuted} fill={canStart ? '#FFF' : 'transparent'} />
              <Text style={[styles.startText, !canStart && styles.startTextDisabled]}>{t.lobby.startGame}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  teamsRow: { flexDirection: 'row', gap: 8 },
  teamColumn: { flex: 1 },
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, marginBottom: 10 },
  teamName: { fontSize: 16, fontWeight: '800', flex: 1 },
  teamCount: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  teamCountText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  vsContainer: { width: 36, alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  vsText: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, marginTop: 4 },
  playerCard: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border },
  playerName: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1 },
  playerActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  teamHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic', marginTop: 4 },
  infoBox: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: Colors.border },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10 },
  startButtonDisabled: { borderWidth: 1, borderColor: Colors.border },
  startText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  startTextDisabled: { color: Colors.textMuted },
});
