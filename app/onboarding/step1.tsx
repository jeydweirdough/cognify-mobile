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

const OPTIONS = [
  { id: 1, label: 'Just getting started', icon: '🤩' },
  { id: 2, label: 'Somewhat ready', icon: '😎' },
  { id: 3, label: 'Almost there', icon: '💪' },
  { id: 4, label: 'Confident', icon: '🧠' },
];

export default function Step1() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () => {
    if (selected !== null) {
      router.push('/onboarding/step2');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: '#E0E0E0' }]} />
          <View style={[styles.progressBar, styles.progressSpacer, { backgroundColor: '#E0E0E0' }]} />
          <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]} />
        </View>

        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.title}>
            How ready do you feel{'\n'}
            for the Psychometrician{'\n'}
            Licensure Exam?
          </Text>
          <Text style={styles.subtitle}>
            Don’t worry, this isn’t a test—just a quick check to personalize your review experience
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option, idx) => {
            const isSelected = selected === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  isSelected ? styles.optionSelected : styles.optionInactive,
                  idx > 0 ? styles.optionSpacing : null,
                ]}
                onPress={() => setSelected(option.id)}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionText,
                  { fontWeight: isSelected ? '700' : '500' }
                ]}>
                  {option.label}
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
    paddingHorizontal: 54,
    // Increased top padding to push everything down
    paddingTop: 120, 
    paddingBottom: 100, 
  },
  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50, 
  },
  progressBar: {
    height: 10, // Thicker bar (was 6)
    width: 65,  // Slightly wider to match thickness
    borderRadius: 5,
  },
  progressSpacer: {
    marginRight: 12,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    // Increased space between Question and Subtext
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
  // Options
  optionsContainer: {},
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
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
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  // Button
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
