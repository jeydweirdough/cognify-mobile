import { useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import { api } from '../../lib/api';
import { Stack } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { Assessment, PaginatedResponse } from '../../lib/types';

export default function AssessmentsScreen() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Assessment>>('/assessments/', {
        params: { limit: 50 }
      });
      setAssessments(data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch assessments:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessment: Assessment) => {
    // For now, just show an alert
    // You can create a full assessment screen similar to quiz screen
    alert(`Assessment: ${assessment.title}\n\nThis feature will be available soon!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Assessments' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Practice Assessments',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontFamily: Fonts.semiBold },
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Assessments</Text>
        <Text style={styles.headerSubtitle}>
          Test your knowledge with mock exams
        </Text>
      </View>

      <FlatList
        data={assessments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => startAssessment(item)}>
            <View style={styles.cardHeader}>
              <View style={styles.typeContainer}>
                <FontAwesome
                  name={item.type === 'mock' ? 'file-text' : 'pencil'}
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.typeText}>{item.type || 'Assessment'}</Text>
              </View>
              {item.total_items && (
                <View style={styles.itemsBadge}>
                  <Text style={styles.itemsText}>{item.total_items} items</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            {item.instructions && (
              <Text style={styles.cardInstructions} numberOfLines={2}>
                {item.instructions}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.infoRow}>
                <FontAwesome name="clock-o" size={14} color={Colors.textLight} />
                <Text style={styles.infoText}>
                  ~{Math.ceil((item.total_items || 0) * 1.5)} min
                </Text>
              </View>
              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start</Text>
                <FontAwesome name="chevron-right" size={12} color={Colors.primary} />
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="file-text-o" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No assessments available yet</Text>
            <Text style={styles.emptySubtext}>
              Check back later for practice tests
            </Text>
          </View>
        }
      />
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  itemsBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemsText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.text,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  cardInstructions: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 6,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
}); 