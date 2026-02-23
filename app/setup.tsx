import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Clock,
  Target,
  Users,
  Flame,
  Baby,
  UserPlus,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AgeGroup, Difficulty } from '@/types/game';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, addPlayer, players, resetGame } = useGame();
  const { t } = useLanguage();
  const [playerName, setPlayerName] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    if (!trimmed || players.length >= 10) return;
    const team = players.filter((p) => p.team === 'A').length <=
      players.filter((p) => p.team === 'B').length
      ? 'A'
      : 'B';
    addPlayer(trimmed, team);
    setPlayerName('');
  };

  const canProceed = players.length >= 4;

  const ageGroups: AgeGroup[] = ['cocuk', 'genc', 'yetiskin'];
  const difficulties: Difficulty[] = ['kolay', 'orta', 'zor'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0E21', '#121837', '#0A0E21']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { resetGame(); router.back(); }}
          style={styles.backButton}
          testID="back-button"
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.setup.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <UserPlus size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{t.setup.players}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{players.length}</Text>
                </View>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={t.setup.playerNamePlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  value={playerName}
                  onChangeText={setPlayerName}
                  onSubmitEditing={handleAddPlayer}
                  returnKeyType="done"
                  maxLength={15}
                  testID="player-name-input"
                />
                <TouchableOpacity
                  onPress={handleAddPlayer}
                  style={[styles.addButton, (!playerName.trim() || players.length >= 10) && styles.addButtonDisabled]}
                  disabled={!playerName.trim() || players.length >= 10}
                  testID="add-player-button"
                >
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {players.length > 0 && (
                <View style={styles.playerChips}>
                  {players.map((p) => (
                    <View
                      key={p.id}
                      style={[
                        styles.chip,
                        { backgroundColor: p.team === 'A' ? Colors.teamALight : Colors.teamBLight },
                      ]}
                    >
                      <View
                        style={[
                          styles.chipDot,
                          { backgroundColor: p.team === 'A' ? Colors.teamA : Colors.teamB },
                        ]}
                      />
                      <Text style={styles.chipText}>{p.nickname}</Text>
                    </View>
                  ))}
                </View>
              )}

              {players.length < 4 && (
                <Text style={styles.hint}>{t.setup.minPlayersHint}</Text>
              )}
              {players.length >= 10 && (
                <Text style={styles.hint}>{t.setup.maxPlayersHint}</Text>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Baby size={18} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>{t.setup.ageGroup}</Text>
              </View>
              <View style={styles.optionRow}>
                {ageGroups.map((ag) => (
                  <TouchableOpacity
                    key={ag}
                    style={[
                      styles.optionButton,
                      settings.ageGroup === ag && styles.optionButtonActive,
                    ]}
                    onPress={() => updateSettings({ ageGroup: ag })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        settings.ageGroup === ag && styles.optionTextActive,
                      ]}
                    >
                      {t.ageGroups[ag]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Flame size={18} color={Colors.error} />
                <Text style={styles.sectionTitle}>{t.setup.difficulty}</Text>
              </View>
              <View style={styles.optionRow}>
                {difficulties.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.optionButton,
                      settings.difficulty === d && styles.optionButtonActiveDifficulty,
                    ]}
                    onPress={() => updateSettings({ difficulty: d })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        settings.difficulty === d && styles.optionTextActive,
                      ]}
                    >
                      {t.difficulties[d]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={18} color={Colors.success} />
                <Text style={styles.sectionTitle}>{t.setup.targetScore}</Text>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ targetScore: Math.max(10, settings.targetScore - 5) })}
                >
                  <Minus size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.counterValue}>
                  <Text style={styles.counterNumber}>{settings.targetScore}</Text>
                  <Text style={styles.counterLabel}>{t.setup.points}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ targetScore: Math.min(100, settings.targetScore + 5) })}
                >
                  <Plus size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color={Colors.teamA} />
                <Text style={styles.sectionTitle}>{t.setup.turnDuration}</Text>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ turnDuration: Math.max(30, settings.turnDuration - 10) })}
                >
                  <Minus size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.counterValue}>
                  <Text style={styles.counterNumber}>{settings.turnDuration}</Text>
                  <Text style={styles.counterLabel}>{t.setup.seconds}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ turnDuration: Math.min(120, settings.turnDuration + 10) })}
                >
                  <Plus size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={18} color={Colors.warning} />
                <Text style={styles.sectionTitle}>{t.setup.passLimit}</Text>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ passLimit: Math.max(0, settings.passLimit - 1) })}
                >
                  <Minus size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.counterValue}>
                  <Text style={styles.counterNumber}>{settings.passLimit}</Text>
                  <Text style={styles.counterLabel}>{t.setup.passes}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateSettings({ passLimit: Math.min(10, settings.passLimit + 1) })}
                >
                  <Plus size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          onPress={() => router.push('/lobby' as any)}
          disabled={!canProceed}
          activeOpacity={0.8}
          testID="continue-button"
        >
          <LinearGradient
            colors={canProceed ? [Colors.primary, '#FF8A65'] : [Colors.surface, Colors.surface]}
            style={[styles.continueButton, !canProceed && styles.continueButtonDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.continueText, !canProceed && styles.continueTextDisabled]}>
              {t.setup.setupTeams}
            </Text>
            <ArrowRight size={20} color={canProceed ? '#FFF' : Colors.textMuted} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  badge: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border },
  addButton: { width: 50, height: 50, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  addButtonDisabled: { backgroundColor: Colors.surface, opacity: 0.5 },
  playerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  hint: { fontSize: 13, color: Colors.textMuted, marginTop: 10, fontStyle: 'italic' },
  optionRow: { flexDirection: 'row', gap: 10 },
  optionButton: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  optionButtonActive: { backgroundColor: Colors.teamALight, borderColor: Colors.teamA },
  optionButtonActiveDifficulty: { backgroundColor: 'rgba(255, 90, 60, 0.15)', borderColor: Colors.primary },
  optionText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  optionTextActive: { color: Colors.text },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  counterButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  counterValue: { alignItems: 'center', minWidth: 80 },
  counterNumber: { fontSize: 32, fontWeight: '800', color: Colors.text },
  counterLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10 },
  continueButtonDisabled: { borderWidth: 1, borderColor: Colors.border },
  continueText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  continueTextDisabled: { color: Colors.textMuted },
});
