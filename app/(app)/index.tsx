import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
// --- FIX: Import the new Recommendation type ---
import type { Motivation, StudentAnalytics, Recommendation } from '../../lib/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  // --- FIX: Use the new type ---
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      const [motivationRes, analyticsRes, recsRes] = await Promise.all([
        api.get(`/utilities/motivation/${user.id}`),
        api.get(`/analytics/student_report/${user.id}`),
        // --- FIX: This endpoint is now correct ---
        api.get(`/recommendations/by_student/${user.id}`, { params: { limit: 3 } }),
      ]);

      setMotivation(motivationRes.data);
      setAnalytics(analyticsRes.data);
      setRecommendations(recsRes.data.items || []);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateNewMotivation = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data } = await api.post(`/utilities/motivation/generate/${user.id}`);
      setMotivation(data);
    } catch (error: any) {
      console.error('Failed to generate motivation:', error.response?.data || error.message);
      alert('Failed to generate new quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const passPercentage = analytics?.prediction?.pass_probability || 0;
  const isPassing = analytics?.prediction?.predicted_to_pass || false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerHi}>Hi, {user?.first_name || 'Student'}! 👋</Text>
          <Text style={styles.headerTitle}>Your Study Dashboard</Text>
        </View>

        {/* Motivation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="quote-left" size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Daily Motivation</Text>
          </View>
          <Text style={styles.quoteText}>"{motivation?.quote || 'Loading...'}"</Text>
          <Text style={styles.authorText}>— {motivation?.author || '...'}</Text>
          <Pressable style={styles.refreshButton} onPress={generateNewMotivation}>
            <FontAwesome name="refresh" size={14} color={Colors.primary} />
            <Text style={styles.refreshButtonText}>Get New Quote</Text>
          </Pressable>
        </View>

        {/* Performance Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="bar-chart" size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Performance Summary</Text>
          </View>
          
          {analytics ? (
            <>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Overall Score:</Text>
                <Text style={styles.statValue}>
                  {analytics.summary.overall_score.toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Activities Completed:</Text>
                <Text style={styles.statValue}>{analytics.summary.total_activities}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Time Spent:</Text>
                <Text style={styles.statValue}>
                  {Math.floor(analytics.summary.time_spent_sec / 3600)}h {Math.floor((analytics.summary.time_spent_sec % 3600) / 60)}m
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.predictionRow}>
                <FontAwesome
                  name={isPassing ? 'check-circle' : 'exclamation-circle'}
                  size={20}
                  color={isPassing ? '#4CAF50' : '#FF9800'}
                />
                <Text style={[styles.predictionText, { color: isPassing ? '#4CAF50' : '#FF9800' }]}>
                  {isPassing ? 'On Track to Pass' : 'Needs Improvement'}
                </Text>
              </View>
              <Text style={styles.predictionDetail}>
                Pass Probability: {passPercentage.toFixed(1)}%
              </Text>
            </>
          ) : (
            <Text style={styles.emptyText}>No performance data yet. Start studying!</Text>
          )}
        </View>

        {/* Recommendations Card */}
        {recommendations.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="lightbulb-o" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Recommended for You</Text>
            </View>
            
            {recommendations.map((rec) => ( // --- FIX: `rec` is now the correct type
              <View key={rec.id} style={styles.recItem}>
                <Text style={styles.recTopic}>{rec.recommended_topic}</Text>
                <Text style={styles.recReason}>{rec.reason}</Text>
                <Pressable
                  style={[
                    styles.recButton, 
                    (!rec.recommended_modules || rec.recommended_modules.length === 0) && styles.recButtonDisabled
                  ]}
                  onPress={() => {
                    if (rec.recommended_modules && rec.recommended_modules.length > 0) {
                      router.push(`/(app)/module/${rec.recommended_modules[0]}` as any);
                    }
                  }}
                  disabled={!rec.recommended_modules || rec.recommended_modules.length === 0}
                  >
                  <Text style={styles.recButtonText}>Start Studying</Text>
                  <FontAwesome name="arrow-right" size={12} color={Colors.primary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/subjects')}>
            <FontAwesome name="book" size={24} color={Colors.white} />
            <Text style={styles.actionButtonText}>Browse Modules</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/assessments')}>
            <FontAwesome name="pencil" size={24} color={Colors.white} />
            <Text style={styles.actionButtonText}>Take Assessment</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerHi: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.text,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  quoteText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  authorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  refreshButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textLight,
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  predictionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginLeft: 8,
  },
  predictionDetail: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 28,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 16,
  },
  recItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  recTopic: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  recReason: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  recButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  recButtonDisabled: {
    opacity: 0.5,
  },
  recButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
    marginRight: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
});