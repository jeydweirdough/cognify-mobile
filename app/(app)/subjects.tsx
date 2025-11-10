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
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { Subject, PaginatedResponse } from '../../lib/types';

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Subject>>('/subjects/', {
        params: { limit: 100 }
      });
      setSubjects(data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subjects</Text>
        <Text style={styles.headerSubtitle}>Choose a subject to start studying</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.subject_id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/subject/${item.subject_id}`)}>
            <View style={styles.iconContainer}>
              <FontAwesome name="book" size={24} color={Colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.subject_name}</Text>
              {item.pqf_level && (
                <Text style={styles.cardSubtitle}>PQF Level {item.pqf_level}</Text>
              )}
            </View>
            <FontAwesome name="chevron-right" size={16} color={Colors.textLight} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="inbox" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No subjects available</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
});