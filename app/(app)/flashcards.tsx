import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { api } from '../../lib/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';
import type { GeneratedFlashcards } from '../../lib/types';

export default function FlashcardsScreen() {
  const { flashcardsId } = useLocalSearchParams<{ flashcardsId: string }>();
  const [flashcardsData, setFlashcardsData] = useState<GeneratedFlashcards | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flipAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!flashcardsId) return;
    fetchFlashcards();
  }, [flashcardsId]);

  const fetchFlashcards = async () => {
    try {
      // --- FIX: Fetch flashcards directly by their ID ---
      const { data } = await api.get<GeneratedFlashcards>(
        `/generate/generated_flashcards/${flashcardsId}`
      );
      setFlashcardsData(data);
      // --- END FIX ---
    } catch (error: any) {
      console.error('Failed to fetch flashcards:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    if (flipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setFlipped(!flipped);
  };

  const nextCard = () => {
    if (!flashcardsData) return;
    
    if (currentIndex < flashcardsData.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!flashcardsData || flashcardsData.flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Flashcards' }} />
        <View style={styles.centered}>
          <FontAwesome name="th-large" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No flashcards available</Text>
        </View>
      </View>
    );
  }

  const currentCard = flashcardsData.flashcards[currentIndex];
  
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Flashcard ${currentIndex + 1}/${flashcardsData.flashcards.length}`,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {flashcardsData.flashcards.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / flashcardsData.flashcards.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Flashcard */}
        <Pressable onPress={flipCard} style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
              flipped && styles.cardHidden,
            ]}>
            {currentCard.tos_topic_title && (
              <View style={styles.topicBadge}>
                <Text style={styles.topicText}>
                  {currentCard.tos_topic_title} • {currentCard.aligned_bloom_level}
                </Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <FontAwesome name="question-circle" size={32} color={Colors.primary} />
              <Text style={styles.cardText}>{currentCard.question}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
              !flipped && styles.cardHidden,
            ]}>
            {currentCard.tos_topic_title && (
              <View style={styles.topicBadge}>
                <Text style={styles.topicText}>
                  {currentCard.tos_topic_title} • {currentCard.aligned_bloom_level}
                </Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <FontAwesome name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.cardText}>{currentCard.answer}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>
        </Pressable>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Pressable
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={previousCard}
            disabled={currentIndex === 0}>
            <FontAwesome name="chevron-left" size={20} color={Colors.white} />
          </Pressable>

          <Pressable style={styles.flipButton} onPress={flipCard}>
            <FontAwesome name="refresh" size={20} color={Colors.white} />
            <Text style={styles.flipButtonText}>Flip Card</Text>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              currentIndex === flashcardsData.flashcards.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={nextCard}
            disabled={currentIndex === flashcardsData.flashcards.length - 1}>
            <FontAwesome name="chevron-right" size={20} color={Colors.white} />
          </Pressable>
        </View>

        {/* Finish Button */}
        {currentIndex === flashcardsData.flashcards.length - 1 && (
          <Pressable style={styles.finishButton} onPress={() => router.back()}>
            <FontAwesome name="check" size={16} color={Colors.white} />
            <Text style={styles.finishButtonText}>Finish & Return</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ... styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    position: 'absolute',
  },
  cardBack: {
    position: 'absolute',
  },
  cardHidden: {
    opacity: 0,
  },
  topicBadge: {
    position: 'absolute',
    top: 16,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topicText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.text,
  },
  cardContent: {
    alignItems: 'center',
    gap: 24,
  },
  cardText: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.3,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  flipButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  finishButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
});