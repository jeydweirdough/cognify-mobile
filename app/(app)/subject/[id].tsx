import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '../../../lib/api';
import { Link, Href, Stack, useLocalSearchParams } from 'expo-router';

interface Module {
  id: string;
  subject_id: string;
  title: string;
  bloom_level: string;
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const [modules, setModules] = useState<Module[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [subjectRes, modulesRes] = await Promise.all([
          api.get(`/subjects/${id}`), 
          api.get(`/modules/by_subject/${id}`) 
        ]);
        
        setSubject(subjectRes.data);
        setModules(modulesRes.data.items || []);
      } catch (e: any) {
        // --- ADDED CONSOLE LOG ---
        console.error('Failed to fetch subject or module data:', e.response?.data || e.message);
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: subject?.subject_name || 'Subject' }} />
      
      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/(app)/module/${item.id}` as Href} asChild>
            <Pressable>
              <ThemedView style={styles.item}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={styles.bloomText}>
                  Bloom Level: {item.bloom_level || 'N/A'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bloomText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});