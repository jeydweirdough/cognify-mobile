import React from 'react';
import { StyleSheet, View } from 'react-native';

const Colors = { primary: '#4B2C6F' }; // Deep Purple

export const OnboardingProgress = ({ step }: { step: number }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { backgroundColor: i <= step ? Colors.primary : '#E0E0E0' },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  bar: {
    height: 6,
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 3,
  },
});