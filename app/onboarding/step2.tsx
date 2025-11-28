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

const SUBJECTS = [
  'Pyschology Assessment',
  'Abnormal Psychology',
  'Developmental Psychology',
  'I / O Psychology',
];

export default function Step2() {
  const router = useRouter();
  // Changed state to an array to hold multiple selections
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (subject: string) => {
    if (selected.includes(subject)) {
      // Remove if already selected
      setSelected(selected.filter((item) => item !== subject));
    } else {
      // Add if not selected
      setSelected([...selected, subject]);
    }
  };

  const handleNext = () => {
    // Only proceed if at least one item is selected
    if (selected.length > 0) {
      router.push('/onboarding/step3');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Progress Bar (2nd active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]} />
          <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]} />
        </View>

        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.title}>
            What Subjects Do You{'\n'}
            Feel Most Confident In?
          </Text>
          <Text style={styles.subtitle}>
            Identify subject strengths to balance the review plan.
            (Select all that apply)
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {SUBJECTS.map((subject) => {
            // Check if array includes this subject
            const isSelected = selected.includes(subject);
            return (
              <TouchableOpacity
                key={subject}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  isSelected ? styles.optionSelected : styles.optionInactive,
                ]}
                onPress={() => toggleSelection(subject)}
              >
                {/* Text centered for subjects */}
                <Text style={[
                  styles.optionText,
                  { fontWeight: isSelected ? '700' : '500', textAlign: 'center', width: '100%' }
                ]}>
                  {subject}
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
            selected.length === 0 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selected.length === 0}
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
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center', // Centered text
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
    fontSize: 15, // Slightly smaller to fit long subjects
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