import { Colors, Fonts } from '@/constants/cognify-theme';
import { getStudentReportAnalytics, listSubjects } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Subject } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SubjectCard } from '@/components/subjects/SubjectCard';

export default function SubjectsScreen() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH & MERGE LOGIC ---
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Subjects List
      const subjectsData = await listSubjects();
      const items = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.items || []);

      // 2. Fetch User Progress (if logged in)
      let progressMap: Record<string, any> = {};
      if (user?.id) {
        try {
          const report = await getStudentReportAnalytics(user.id);
          const analytics = report?.data || report || {};
          const reports = analytics.progress_report || [];
          
          reports.forEach((r: any) => {
            const sid = String(r.subject_id || r.subjectId || '');
            progressMap[sid] = {
                overall: Number(r.overall_completeness ?? 0),
                modules: Number(r.modules_completeness ?? 0),
                assessments: Number(r.assessment_completeness ?? 0)
            };
          });
        } catch (e) {
          console.log('Failed to load analytics for subjects', e);
        }
      }

      // 3. Merge Progress into Subjects
      const merged = items.map((s: any) => {
        const stats = progressMap[String(s.id)] || { overall: 0, modules: 0, assessments: 0 };
        return {
            ...s,
            // Inject the progress we found (default 0)
            progress: stats.overall,
            // Logic: If modules are done (100%) but assessment is not ( < 80% or 100%), they are ready for Post-Assessment
            isReadyForPostAssessment: stats.modules >= 100 && stats.assessments < 100
        };
      });

      setSubjects(merged);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filteredSubjects = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Subjects</Text>
          <Text style={styles.headerSubtitle}>Explore your learning path</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
        renderItem={({ item, index }) => (
          <SubjectCard
            subject={item}
            index={index}
            onPress={() =>
              router.push({
                pathname: '/(app)/subject/[id]',
                params: { id: item.id, subjectTitle: item.title },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subjects found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', paddingBottom: 15 },
  headerTitle: { fontFamily: Fonts.poppinsMedium, fontSize: 24, color: '#333' },
  headerSubtitle: { fontFamily: Fonts.poppinsRegular, fontSize: 14, color: '#666', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: Fonts.poppinsRegular, fontSize: 14, color: '#333' },
  listContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: Fonts.poppinsRegular, color: '#999' },
});