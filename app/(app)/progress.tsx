import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { StudentAnalytics } from '../../lib/types';

// Helper to get Bloom level color
const getBloomColor = (level: string): string => {
  const colors: Record<string, string> = {
    remembering: '#4CAF50',
    understanding: '#2196F3',
    applying: '#FF9800',
    analyzing: '#9C27B0',
    evaluating: '#F44336',
    creating: '#E91E63',
  };
  return colors[level.toLowerCase()] || Colors.textLight;
};

export default function ProgressScreen() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      const { data } = await api.get<StudentAnalytics>(
        `/analytics/student_report/${user.id}`
      );
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress & Analytics</Text>
        </View>
        <View style={styles.centered}>
          <FontAwesome name="line-chart" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            No analytics data yet. Complete some activities to see your progress!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPassing = analytics.prediction.predicted_to_pass;
  const passPercentage = analytics.prediction.pass_probability;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress & Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Track your study performance and readiness
          </Text>
        </View>

        <View style={styles.content}>
          {/* Pass Prediction Card */}
          <View style={[styles.card, styles.predictionCard]}>
            <View style={styles.predictionHeader}>
              <FontAwesome
                name={isPassing ? 'check-circle' : 'exclamation-triangle'}
                size={32}
                color={isPassing ? '#4CAF50' : '#FF9800'}
              />
              <Text style={[styles.predictionStatus, { color: isPassing ? '#4CAF50' : '#FF9800' }]}>
                {isPassing ? 'On Track to Pass!' : 'Keep Practicing'}
              </Text>
            </View>

            <View style={styles.predictionBody}>
              <Text style={styles.predictionLabel}>Pass Probability</Text>
              <Text style={styles.predictionValue}>{passPercentage.toFixed(1)}%</Text>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${passPercentage}%`,
                      backgroundColor: isPassing ? '#4CAF50' : '#FF9800',
                    },
                  ]}
                />
              </View>

              <Text style={styles.predictionNote}>
                {isPassing
                  ? 'Great work! Continue your study routine to maintain readiness.'
                  : 'Focus on your weak areas and complete more practice activities.'}
              </Text>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="bar-chart" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Overall Summary</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <FontAwesome name="star" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>
                  {analytics.summary.overall_score.toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>

              <View style={styles.statBox}>
                <FontAwesome name="check-square" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{analytics.summary.total_activities}</Text>
                <Text style={styles.statLabel}>Activities Done</Text>
              </View>

              <View style={styles.statBox}>
                <FontAwesome name="clock-o" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>
                  {Math.floor(analytics.summary.time_spent_sec / 3600)}h
                </Text>
                <Text style={styles.statLabel}>Time Studied</Text>
              </View>
            </View>
          </View>

          {/* Bloom's Taxonomy Performance */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="bar-chart" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Performance by Cognitive Level</Text>
            </View>

            <Text style={styles.cardSubtitle}>
              Based on Bloom's Taxonomy (PRC TOS)
            </Text>

            {Object.entries(analytics.performance_by_bloom).length > 0 ? (
              Object.entries(analytics.performance_by_bloom).map(([level, score]) => (
                <View key={level} style={styles.bloomItem}>
                  <View style={styles.bloomHeader}>
                    <View
                      style={[
                        styles.bloomDot,
                        { backgroundColor: getBloomColor(level) },
                      ]}
                    />
                    <Text style={styles.bloomLevel}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                    <Text style={styles.bloomScore}>{score.toFixed(1)}%</Text>
                  </View>

                  <View style={styles.bloomBarContainer}>
                    <View
                      style={[
                        styles.bloomBarFill,
                        {
                          width: `${score}%`,
                          backgroundColor: getBloomColor(level),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyBloomText}>
                No cognitive level data yet. Complete more activities!
              </Text>
            )}
          </View>

          {/* Tips Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="lightbulb-o" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Study Tips</Text>
            </View>

            <View style={styles.tipItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Review modules daily for consistent progress
              </Text>
            </View>

            <View style={styles.tipItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Focus on lower-scoring cognitive levels
              </Text>
            </View>

            <View style={styles.tipItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Take practice quizzes to test your understanding
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 24,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
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
  predictionCard: {
    backgroundColor: Colors.background,
  },
  predictionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionStatus: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginTop: 12,
  },
  predictionBody: {
    alignItems: 'center',
  },
  predictionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  predictionValue: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    color: Colors.primary,
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
  },
  predictionNote: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  bloomItem: {
    marginBottom: 16,
  },
  bloomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bloomDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  bloomLevel: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.text,
  },
  bloomScore: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
  },
  bloomBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bloomBarFill: {
    height: '100%',
  },
  emptyBloomText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
});