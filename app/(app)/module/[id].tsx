import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '../../../lib/api';
import { Stack, useLocalSearchParams } from 'expo-router';

interface Module {
  id: string;
  title: string;
}

interface GeneratedSummary {
  id: string;
  summary_text: string;
}

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const [module, setModule] = useState<Module | null>(null);
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [moduleRes, summaryRes] = await Promise.all([
          api.get(`/modules/${id}`),
          api.get(`/generate/generated_summaries/for_module/${id}`)
        ]);
        
        setModule(moduleRes.data);
        if (summaryRes.data.items && summaryRes.data.items.length > 0) {
          setSummary(summaryRes.data.items[0]);
        }

      } catch (e: any) {
        // --- ADDED CONSOLE LOG ---
        console.error('Failed to fetch module or summary data:', e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: module?.title || 'Module' }} />
      
      <ThemedView style={styles.content}>
        <ThemedText type="title">{module?.title || 'Loading...'}</ThemedText>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          AI Generated Summary
        </ThemedText>

        {summary ? (
          <ThemedText style={styles.bodyText}>
            {summary.summary_text}
          </ThemedText>
        ) : (
          <ThemedText style={styles.bodyText}>
            No AI summary has been generated for this module yet.
          </ThemedText>
        )}
        
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
});