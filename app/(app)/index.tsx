import { useEffect, useState } from 'react';
import { StyleSheet, Button, ActivityIndicator, SafeAreaView, View, Text, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';

interface Motivation {
  quote: string;
  author: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMotivation = async () => { /* ... (no changes to this function) ... */ };
  const generateNewMotivation = async () => { /* ... (no changes to this function) ... */ };
  
  // Omitted fetch/generate functions for brevity, copy them from your existing file
  
  // ... useEffect(() => { ... }, [user]); 

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerHi}>Hi, {user?.first_name || 'Student'}</Text>
          <Text style={styles.headerTitle}>Study Plan</Text>
        </View>

        {/* This card shows the user's motivation */}
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Text style={styles.locationText}>{motivation?.quote || "Loading..."}</Text>
              <View style={styles.divider} />
              <Text style={styles.locationText}>{motivation?.author || "..."}</Text>
            </>
          )}
        </View>

        {/* This card is just for show, as in the design */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Progress</Text>
            <Text style={styles.rowValue}>4 modules</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Next Up</Text>
            <Text style={styles.rowValue}>Theories of Personality</Text>
          </View>
        </View>

        <Pressable style={styles.searchButton} onPress={generateNewMotivation}>
          <Text style={styles.searchButtonText}>GET NEW QUOTE</Text>
        </Pressable>
      </View>
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
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  headerHi: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  locationText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
  },
  rowValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});