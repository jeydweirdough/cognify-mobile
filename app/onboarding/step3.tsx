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

const DURATIONS = ['30 min', '1 - 2 hours', '3 - 4 hours', 'Flexible'];

export default function Step3() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected !== null) {
      router.push('/onboarding/step4');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Progress Bar (3rd active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]} />
        </View>

        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Set Your Daily Study{'\n'}
            Goal 🔥
          </Text>
          <Text style={styles.subtitle}>
            Choose how much time you can dedicate to learning each day
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {DURATIONS.map((time, idx) => {
            const isSelected = selected === time;
            return (
              <TouchableOpacity
                key={time}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  isSelected ? styles.optionSelected : styles.optionInactive,
                  idx > 0 ? styles.optionSpacing : null,
                ]}
                onPress={() => setSelected(time)}
              >
                <Text style={[
                  styles.optionText,
                  { fontWeight: isSelected ? '700' : '500', textAlign: 'center', width: '100%' }
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* NEXT BUTTON */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            selected === null && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selected === null}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
  optionsContainer: {},
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
  },
  optionSpacing: {
    marginTop: 16,
  },
  optionInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#777',
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
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
