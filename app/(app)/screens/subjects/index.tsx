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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Assuming these are defined elsewhere or passed correctly
import { AddSubjectModal } from "@/components/subjects/AddSubjectModal";
import MotivationCard from "@/components/subjects/Motivation-quote";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import Header from "@/components/ui/header";

const Colors = {
  background: "#F8F8F8",
  white: "#FFFFFF",
  text: "#333333",
  primary: "#6A2A94",
};

// Re-defining Fonts object locally for completeness if it's not imported correctly
const Fonts = {
  semiBold: "LexendDeca-Medium",
  regular: "LexendDeca-Regular",
  poppinsRegular: "Poppins-Regular",
};

const COLOR_PALETTE = [
  { iconColor: "#D8C713", iconBgColor: "#F0F5D5", cardBgColor: "#FDFFB8" },
  { iconColor: "#4C609B", iconBgColor: "#E2E6F2", cardBgColor: "#FFE8CD" },
  { iconColor: "#30C49F", iconBgColor: "#FCF5EE", cardBgColor: "#FCF5EE" },
  { iconColor: "#D38A4D", iconBgColor: "#F9ECE3", cardBgColor: "#F4F8D3" },
];

// Define the expected structure of a Subject item returned from the backend's list endpoint
interface BackendSubject {
  id: string;
  title: string;
  description?: string;
  topics_count: number;
  [key: string]: any;
}

// Define the enriched Subject structure for the UI
interface UISubject {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  iconBgColor: string;
  cardBgColor: string;
  topicIds: string[]; // List of topic IDs for progress calculation
}

export default function LearningScreen() {
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