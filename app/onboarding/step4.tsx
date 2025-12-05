import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#4B2C6F',
  primaryLight: '#FAD9F5',
  textDark: '#1A1A1A',
  textGray: '#666666',
  background: '#FFFFFF',
  disabled: '#D3D3D3',
};

const AVATARS = [
  { id: 1, color: '#F4D03F', source: require('@/assets/images/fm1.png') },
  { id: 2, color: '#F5B7B1', source: require('@/assets/images/m1.png') },
  { id: 3, color: '#E67E22', source: require('@/assets/images/fm2.png') },
  { id: 4, color: '#EDBB99', source: require('@/assets/images/m2.png') },
  { id: 5, color: '#EDBB99', source: require('@/assets/images/fm3.png') },
  { id: 6, color: '#EDBB99', source: require('@/assets/images/m3.png') },
  { id: 7, color: '#EDBB99', source: require('@/assets/images/fm4.png') },
  { id: 8, color: '#EDBB99', source: require('@/assets/images/m4.png') },
  { id: 9, color: '#EDBB99', source: require('@/assets/images/fm5.png') },
];

export default function Step4() {
  const router = useRouter();
  const { updateProfile, setUser } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);

  const handleFinish = async () => {
    if (selected !== null) {
      if (selectedUri) {
        try {
          await updateProfile({ profile_picture: selectedUri } as any);
        } catch {}
      }
      await storage.setItem('onboarding_completed', 'true');
      router.replace('/(app)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Progress Bar (All active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
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
                onPress={() => {
                  setSelected(avatar.id);
                  const asset = Asset.fromModule(avatar.source);
                  const resolved = asset?.uri as string;
                  setSelectedUri(resolved);
                  try {
                    // Optimistic local update so headers refresh instantly
                    setUser((prev) => (prev ? { ...prev, profile_picture: resolved } : prev));
                    updateProfile({ profile_picture: resolved } as any);
                  } catch {}
                }}
              >
                <Image source={avatar.source} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
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
    marginBottom: 50,
  },
  progressBar: {
    height: 10,
    width: 65,
    borderRadius: 5,
  },
  progressSpacer: {
    marginRight: 12,
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
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    marginBottom: 12,
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
