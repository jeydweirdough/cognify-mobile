import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Linking,
} from 'react-native';
import { api } from '../../../lib/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Colors, Fonts } from '../../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type {
  Module,
  GeneratedSummary,
  GeneratedQuiz,
  GeneratedFlashcards,
  PaginatedResponse,
} from '../../../lib/types';

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [flashcards, setFlashcards] = useState<GeneratedFlashcards | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingActivity, setStartingActivity] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [moduleRes, summaryRes, quizRes, flashcardsRes] = await Promise.all([
        api.get<Module>(`/modules/${id}`),
        api.get<PaginatedResponse<GeneratedSummary>>(
          `/generate/generated_summaries/for_module/${id}`
        ),
        api.get<PaginatedResponse<GeneratedQuiz>>(
          `/generate/generated_quizzes/for_module/${id}`
        ),
        api.get<PaginatedResponse<GeneratedFlashcards>>(
          `/generate/generated_flashcards/for_module/${id}`
        ),
      ]);

      setModule(moduleRes.data);
      setSummary(summaryRes.data.items[0] || null);
      setQuiz(quizRes.data.items[0] || null);
      setFlashcards(flashcardsRes.data.items[0] || null);
    } catch (error: any) {
      console.error('Failed to fetch module data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMaterial = async () => {
    if (!module?.material_url) return;
    
    const supported = await Linking.canOpenURL(module.material_url);
    if (supported) {
      await Linking.openURL(module.material_url);
    } else {
      alert("Can't open this URL: " + module.material_url);
    }
  };

  const startQuiz = () => {
    if (!quiz) {
      alert('No quiz available for this module yet.');
      return;
    }
    router.push(`/(app)/quiz?quizId=${quiz.id}&moduleId=${id}` as any);
  };

  const viewFlashcards = () => {
    if (!flashcards) {
      alert('No flashcards available for this module yet.');
      return;
    }
    router.push(`/(app)/flashcards?flashcardsId=${flashcards.id}` as any);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: module?.title || 'Module',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontFamily: Fonts.semiBold },
        }}
      />

      <View style={styles.content}>
        {/* Module Info Card */}
        <View style={styles.card}>
          <Text style={styles.moduleTitle}>{module?.title}</Text>
          {module?.purpose && (
            <Text style={styles.modulePurpose}>{module.purpose}</Text>
          )}

          <View style={styles.metaContainer}>
            {module?.bloom_level && (
              <View style={styles.metaItem}>
                <FontAwesome name="star" size={14} color={Colors.primary} />
                <Text style={styles.metaText}>{module.bloom_level}</Text>
              </View>
            )}
            {module?.estimated_time && (
              <View style={styles.metaItem}>
                <FontAwesome name="clock-o" size={14} color={Colors.primary} />
                <Text style={styles.metaText}>{module.estimated_time} min</Text>
              </View>
            )}
          </View>

          {module?.material_url && (
            <Pressable style={styles.primaryButton} onPress={openMaterial}>
              <FontAwesome name="external-link" size={16} color={Colors.white} />
              <Text style={styles.primaryButtonText}>Open Study Material</Text>
            </Pressable>
          )}
        </View>

        {/* AI Summary Card */}
        {summary && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="file-text" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>AI Summary</Text>
            </View>
            {summary.tos_topic_title && (
              <View style={styles.alignmentBadge}>
                <Text style={styles.alignmentText}>
                  📚 {summary.tos_topic_title} • {summary.aligned_bloom_level}
                </Text>
              </View>
            )}
            <Text style={styles.summaryText}>{summary.summary_text}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Pressable
            style={[styles.actionButton, !quiz && styles.actionButtonDisabled]}
            onPress={startQuiz}
            disabled={!quiz}>
            <FontAwesome name="pencil" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>
              {quiz ? 'Take Quiz' : 'No Quiz Available'}
            </Text>
            {quiz && <Text style={styles.actionButtonSubtext}>{quiz.questions.length} questions</Text>}
          </Pressable>

          <Pressable
            style={[styles.actionButton, !flashcards && styles.actionButtonDisabled]}
            onPress={viewFlashcards}
            disabled={!flashcards}>
            <FontAwesome name="th-large" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>
              {flashcards ? 'Study Flashcards' : 'No Flashcards'}
            </Text>
            {flashcards && (
              <Text style={styles.actionButtonSubtext}>
                {flashcards.flashcards.length} cards
              </Text>
            )}
          </Pressable>
        </View>

        {!summary && !quiz && !flashcards && (
          <View style={styles.emptyCard}>
            <FontAwesome name="info-circle" size={32} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              AI content hasn't been generated for this module yet. Check back later!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  modulePurpose: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.text,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  alignmentBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  alignmentText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
  },
  summaryText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  actionButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtonSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
    opacity: 0.8,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});