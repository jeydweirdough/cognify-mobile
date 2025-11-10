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
import { api } from '../../../lib/api';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Colors, Fonts } from '../../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { Module, Subject, PaginatedResponse } from '../../../lib/types';

// Helper to get Bloom level color
const getBloomColor = (level?: string): string => {
  const colors: Record<string, string> = {
    remembering: '#4CAF50',
    understanding: '#2196F3',
    applying: '#FF9800',
    analyzing: '#9C27B0',
    evaluating: '#F44336',
    creating: '#E91E63',
  };
  return colors[level?.toLowerCase() || ''] || Colors.textLight;
};

export default function SubjectModulesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // --- FIX: Use the new, efficient backend endpoint ---
      const [subjectRes, modulesRes] = await Promise.all([
        api.get<Subject>(`/subjects/${id}`),
        api.get<PaginatedResponse<Module>>(`/modules/by_subject/${id}`, { 
          params: { limit: 100 } 
        }),
      ]);

      setSubject(subjectRes.data);
      setModules(modulesRes.data.items || []); // No client-side filtering needed!
      // --- END FIX ---

    } catch (error: any) {
      console.error('Failed to fetch data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
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
          title: subject?.subject_name || 'Subject',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontFamily: Fonts.semiBold },
        }}
      />

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/module/${item.id}`)}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.bloomBadge,
                  { backgroundColor: getBloomColor(item.bloom_level) + '20' },
                ]}>
                <Text
                  style={[
                    styles.bloomText,
                    { color: getBloomColor(item.bloom_level) },
                  ]}>
                  {item.bloom_level?.toUpperCase() || 'N/A'}
                </Text>
              </View>
              {item.estimated_time && (
                <View style={styles.timeContainer}>
                  <FontAwesome name="clock-o" size={12} color={Colors.textLight} />
                  <Text style={styles.timeText}>{item.estimated_time} min</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            
            {item.purpose && (
              <Text style={styles.cardPurpose} numberOfLines={2}>
                {item.purpose}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.typeContainer}>
                <FontAwesome
                  name={item.material_type === 'video' ? 'play-circle' : 'file-text'}
                  size={14}
                  color={Colors.textLight}
                />
                <Text style={styles.typeText}>{item.material_type || 'Reading'}</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color={Colors.textLight} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="folder-open" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No modules available for this subject</Text>
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
  listContainer: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bloomBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloomText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 6,
  },
  cardPurpose: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
    textTransform: 'capitalize',
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
    textAlign: 'center',
  },
});