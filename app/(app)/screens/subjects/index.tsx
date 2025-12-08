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
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

// Internal Imports (adjust paths based on your project structure)
import { Colors, Fonts } from '@/constants/cognify-theme';
import { getStudentReportAnalytics, listSubjects } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Subject } from '@/lib/types';
import { SubjectCard } from '@/components/subjects/SubjectCard'; // Ensure this path is correct

export default function SubjectsScreen() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 1. STATE FOR SEARCH
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH & MERGE LOGIC ---
  const fetchData = useCallback(async () => {
    try {
      const subjectsData = await listSubjects();
      const items = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.items || []);

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
          console.log('Failed to load analytics', e);
        }
      }

      const merged = items.map((s: any) => {
        const stats = progressMap[String(s.id)] || { overall: 0, modules: 0, assessments: 0 };
        return {
            ...s,
            progress: stats.overall,
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

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // 2. LIVE FILTER LOGIC
  // This runs every time 'subjects' or 'searchQuery' changes
  const filteredSubjects = subjects.filter((s) => {
    // If search is empty, return everything
    if (!searchQuery) return true;
    
    // Check if title includes the search query (Case Insensitive)
    return s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to clear search
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

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

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search subject title..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery} // Makes it "Live"
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />

          {/* Clear Button (Visible only when typing) */}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredSubjects} // Passing the FILTERED list here
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
            <Text style={styles.emptyText}>
              {searchQuery ? `No subjects match "${searchQuery}"` : "No subjects available."}
            </Text>
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
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
    height: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { 
    flex: 1, 
    fontFamily: Fonts.poppinsRegular, 
    fontSize: 14, 
    color: '#333',
    height: '100%' 
  },
  clearBtn: {
    padding: 4,
  },

  listContent: { padding: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: Fonts.poppinsRegular, color: '#999', fontSize: 14 },
});