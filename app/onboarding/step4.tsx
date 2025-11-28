import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#4B2C6F',
  primaryLight: '#FAD9F5',
  textDark: '#1A1A1A',
  textGray: '#666666',
  background: '#FFFFFF',
  disabled: '#D3D3D3',
};

const AVATARS = [
  { id: 1, color: '#F4D03F', emoji: '👩‍🏫' }, 
  { id: 2, color: '#F5B7B1', emoji: '👩🏻‍🎓' }, 
  { id: 3, color: '#E67E22', emoji: '🧑‍🎓' }, 
  { id: 4, color: '#EDBB99', emoji: '👨🏻‍💻' }, 
];

export default function Step4() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const handleFinish = () => {
    if (selected !== null) {
      // Redirect to Main App
      router.replace('/(app)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Progress Bar (All active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
        </View>

        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Pick your Vibes 💅
          </Text>
          <Text style={styles.subtitle}>
            Select a default avatar to represent you inside the app.
          </Text>
        </View>

        {/* Grid Options for Avatars */}
        <View style={styles.gridContainer}>
          {AVATARS.map((avatar) => {
            const isSelected = selected === avatar.id;
            return (
              <TouchableOpacity
                key={avatar.id}
                activeOpacity={0.8}
                style={[
                  styles.avatarCard,
                  { backgroundColor: avatar.color },
                  isSelected && styles.avatarSelected,
                ]}
                onPress={() => setSelected(avatar.id)}
              >
                <Text style={{ fontSize: 50 }}>{avatar.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* FINISH BUTTON */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            selected === null && styles.disabledButton
          ]}
          onPress={handleFinish}
          disabled={selected === null}
        >
          <Text style={styles.nextButtonText}>FINISH</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 54, // Matches Step 1
    paddingTop: 120,       // Matches Step 1
    paddingBottom: 100,    // Matches Step 1
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 50,
  },
  progressBar: {
    height: 10,
    width: 65,
    borderRadius: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  // Grid specific styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  avatarCard: {
    width: '45%', // Fits well with paddingHorizontal: 54
    aspectRatio: 1, // Square
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});