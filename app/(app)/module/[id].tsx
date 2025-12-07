import { getModuleById } from '@/lib/api';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Fonts } from '../../../constants/cognify-theme';

const { width } = Dimensions.get('window');

export default function ModuleReadingScreen() {
  const { id, subjectId } = useLocalSearchParams<{ id: string; subjectId?: string }>();
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [moduleAuthor, setModuleAuthor] = useState<string>('');
  const [moduleInputType, setModuleInputType] = useState<string>('');
  const [moduleMaterialUrl, setModuleMaterialUrl] = useState<string>('');
  const [moduleContent, setModuleContent] = useState<string>('');
  const navigation = useNavigation();

  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize progress from global store
  const initialProgress = (global as any).MODULE_PROGRESS?.[id]
    ? (global as any).MODULE_PROGRESS[id] / 100
    : 0;

  const [readingProgress, setReadingProgress] = useState(initialProgress);
  const maxProgressRef = useRef(initialProgress);

  // --- HIDE BOTTOM TABS ---
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      try {
        const mod = await getModuleById(String(id));
        const t = String(mod?.title ?? '');
        const a = String(mod?.purpose ?? mod?.author ?? mod?.description ?? '');
        const it = String(mod?.input_type ?? '');
        const mu = String(mod?.material_url ?? '');
        const ct = String(mod?.content ?? '');
        if (mounted) {
          if (t) setModuleTitle(t);
          if (a) setModuleAuthor(a);
          if (it) setModuleInputType(it);
          if (mu) setModuleMaterialUrl(mu);
          if (ct) setModuleContent(ct);
        }
      } catch {}
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  // --- SCROLL HANDLER ---
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const visibleHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;
    const scrollY = contentOffset.y;

    const scrollableHeight = contentHeight - visibleHeight;

    if (scrollableHeight > 0) {
      const currentRawProgress = scrollY / scrollableHeight;

      // Cap at 90%
      const cappedProgress = Math.min(currentRawProgress, 0.90);

      // Monotonic Check (Don't go backwards)
      if (cappedProgress > maxProgressRef.current) {
        maxProgressRef.current = cappedProgress;
        setReadingProgress(cappedProgress);

        // Save to Global Store for the list view
        if (!(global as any).MODULE_PROGRESS) (global as any).MODULE_PROGRESS = {};
        (global as any).MODULE_PROGRESS[id] = cappedProgress * 100;
      }
    }
  };

  // --- THEME HELPERS ---
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Dynamic Colors based on state
  const themeColors = {
    background: isDarkMode ? '#121212' : '#F8F9FA',
    textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
    textBody: isDarkMode ? '#E0E0E0' : '#2D2D2D',
    quizBg: isDarkMode ? '#1E1E1E' : '#F3EEF6',
    quizBorder: isDarkMode ? '#333333' : '#E0E0E0',
    footerBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    footerBorder: isDarkMode ? '#333333' : '#F0F0F0',
  };

  const inputType = moduleInputType?.toLowerCase();
  const isPdf = inputType === 'pdf' || (!inputType && moduleMaterialUrl?.toLowerCase().endsWith('.pdf'));
  const pdfSource = moduleMaterialUrl ? { uri: moduleMaterialUrl } : undefined;
  const PdfComponent = Platform.OS !== 'web' ? (() => {
    try { return require('react-native-pdf').default; } catch { return null; }
  })() : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (subjectId) {
              router.push({ pathname: '/(app)/subject/[id]', params: { id: String(subjectId) } });
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </Pressable>

        {/* Theme Toggle Button */}
        <Pressable style={styles.iconButton} onPress={toggleTheme}>
          <Feather
            name={isDarkMode ? "sun" : "moon"}
            size={24}
            color={themeColors.textPrimary}
          />
        </Pressable>
      </View>

      {/* ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {moduleTitle || 'Module'}
        </Text>
        {moduleAuthor ? (
          <Text style={[styles.author, { color: themeColors.textSecondary }]}>
            {moduleAuthor}
          </Text>
        ) : null}

        {isPdf && pdfSource ? (
          Platform.OS === 'web' ? (
            <View style={{ height: width * 1.2, borderRadius: 8, overflow: 'hidden' }}>
              {moduleMaterialUrl ? (
                <iframe
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(moduleMaterialUrl)}`}
                  style={{ width: '100%', height: '100%', border: 'none' } as any}
                />
              ) : null}
            </View>
          ) : (
            <View style={{ height: width * 1.2, borderRadius: 8, overflow: 'hidden' }}>
              <PdfComponent
                source={pdfSource}
                trustAllCerts
                style={{ flex: 1 }}
              />
            </View>
          )
        ) : (
          <Text style={[styles.text, { color: themeColors.textBody }]}>
            {moduleContent || 'No content available.'}
          </Text>
        )}

        {/* Quiz Section (kept optional, can be removed if unwanted) */}
        <View style={[
          styles.quizSection,
          { backgroundColor: themeColors.quizBg, borderColor: themeColors.quizBorder }
        ]}>
          <Text style={[styles.quizPrompt, { color: themeColors.textBody }]}>Finished reading? Test your knowledge to complete this module.</Text>
          <Pressable style={styles.quizButton} onPress={() => router.push({ pathname: '/(app)/quiz/[id]', params: { id: id } })}>
            <Text style={styles.quizButtonText}>Take Quiz</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Extra spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Progress Footer */}
      <View style={[
        styles.footer,
        { backgroundColor: themeColors.footerBg, borderTopColor: themeColors.footerBorder }
      ]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: isDarkMode ? '#A38FDB' : '#381E72' }]}>
            {readingProgress >= 0.9
              ? "90% (Quiz Pending)"
              : `${Math.round(readingProgress * 100)}% Read`}
          </Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${readingProgress * 100}%`, backgroundColor: isDarkMode ? '#A38FDB' : '#381E72' }
            ]}
          />
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background handled dynamically
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#381E72',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  author: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
  },
  text: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'justify',
  },
  // --- Quiz Section ---
  quizSection: {
    marginTop: 40,
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    // Colors handled dynamically
  },
  quizPrompt: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  quizButton: {
    backgroundColor: '#381E72',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#381E72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  quizButtonText: {
    color: '#FFF',
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30, // Safe area padding
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    // Color handled dynamically
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    // Background handled dynamically
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    // Background handled dynamically
  },
});
