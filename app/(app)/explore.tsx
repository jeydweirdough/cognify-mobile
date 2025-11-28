import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '../../lib/api';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { useFonts } from "expo-font";

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
          // Aligns with: routes/modules.py
          api.get(`/modules/${id}`),
          // Aligns with: routes/generated_content.py
          api.get(`/generate/generated_summaries/for_module/${id}`)
        ]);
        
        setModule(moduleRes.data);
        if (summaryRes.data.items && summaryRes.data.items.length > 0) {
          setSummary(summaryRes.data.items[0]);
        }

      } catch (e: any) {
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
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ 
        title: module?.title || 'Module',
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontFamily: Fonts.semiBold }
      }} />
      
      <View style={styles.content}>
        <Text style={styles.titleText}>{module?.title || 'Loading...'}</Text>
        
        <Text style={styles.sectionTitle}>
          AI Generated Summary
        </Text>

        {summary ? (
          <Text style={styles.bodyText}>
            {summary.summary_text}
          </Text>
        ) : (
          <Text style={styles.bodyText}>
            No AI summary has been generated for this module yet.
          </Text>
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
  content: {
    padding: 16,
  },
  titleText: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
});