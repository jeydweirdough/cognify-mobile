import {
  getModuleById,
  getModuleProgress,
  hasTakenAssessment,
  listAssessmentsByModule,
  startStudySession,
  updateModuleProgress,
  updateStudySession
} from '@/lib/api';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { MixedStyleDeclaration } from 'react-native-render-html';
import RenderHtml from 'react-native-render-html';
import { Fonts } from '../../../constants/cognify-theme';

const { width } = Dimensions.get('window');

export default function ModuleReadingScreen() {
  const { id, subjectId } = useLocalSearchParams<{ id: string; subjectId?: string }>();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [moduleAuthor, setModuleAuthor] = useState<string>('');
  const [moduleInputType, setModuleInputType] = useState<string>('');
  const [moduleMaterialUrl, setModuleMaterialUrl] = useState<string>('');
  const [moduleContent, setModuleContent] = useState<string>('');
  const [isHtmlContent, setIsHtmlContent] = useState(false);
  
  // Quiz State
  const [hasVerifiedAssessment, setHasVerifiedAssessment] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [hasTakenThisAssessment, setHasTakenThisAssessment] = useState(false);
  
  // Progress State
  const [readingProgress, setReadingProgress] = useState(0);
  const maxProgressRef = useRef(0);
  const lastSavedPctRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const scrollViewHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // PDF State
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => { navigation.getParent()?.setOptions({ tabBarStyle: undefined }); };
  }, [navigation]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);

      // Load Module
      try {
        const rawMod = await getModuleById(String(id));
        const mod = rawMod?.data || rawMod;
        if (mounted && mod) {
          setModuleTitle(mod.title || '');
          setModuleAuthor(mod.author || mod.purpose || '');
          setModuleInputType(mod.input_type || '');
          setModuleMaterialUrl(mod.material_url || '');
          
          // Check if content is HTML
          const content = mod.content || '';
          const isHtml = /<[^>]+>/.test(content);
          setIsHtmlContent(isHtml);
          setModuleContent(content);
        }
      } catch (e) {}

      // Load Progress
      try {
        const prev = await getModuleProgress(String(id));
        const prevPct = (prev?.percentage || 0) / 100;
        if (mounted) {
          setReadingProgress(prevPct);
          maxProgressRef.current = prevPct;
          lastSavedPctRef.current = Math.round(prevPct * 100);
        }
      } catch {}

      // Load Assessment
      try {
        const assessments = await listAssessmentsByModule(String(id));
        const first = Array.isArray(assessments) ? assessments[0] : undefined;
        if (mounted && first) {
          setHasVerifiedAssessment(true);
          setAssessmentId(first.id);
          const ok: any = await hasTakenAssessment(first.id);

          let taken = false;
          if (typeof ok === 'boolean') {
            taken = ok;
          } else if (typeof ok === 'number') {
            taken = ok === 1;
          } else if (typeof ok === 'string') {
            taken = ok.toLowerCase() === 'true' || ok === '1';
          } else if (ok && typeof ok === 'object') {
            taken = Boolean(ok.taken ?? ok.has_taken ?? ok.data ?? ok.is_taken ?? ok.result ?? false);
          }

          setHasTakenThisAssessment(taken);
        }
      } catch {}

      // Start Session
      try {
        const sessionData = await startStudySession(String(id), 'module');
        if (sessionData?.session_id) {
          sessionIdRef.current = sessionData.session_id;
          sessionStartTimeRef.current = Date.now();
        }
      } catch {}

      if (mounted) setLoading(false);
    };
    run();

    return () => {
      mounted = false;
      if (sessionIdRef.current) {
        const isFinished = maxProgressRef.current >= 0.95;
        updateStudySession(sessionIdRef.current, 0, 0, isFinished).catch(() => {});
      }
      const finalPct = Math.round(maxProgressRef.current * 100);
      updateModuleProgress(String(id), subjectId, finalPct, finalPct >= 100 ? 'completed' : 'in_progress').catch(() => {});
    };
  }, [id]);

  // --- PROGRESS & POPUP LOGIC ---
  const handleProgressUpdate = (newProgress: number) => {
    const capped = Math.min(newProgress, 1);
    
    if (capped > maxProgressRef.current) {
      maxProgressRef.current = capped;
      setReadingProgress(capped);

      const pctInt = Math.round(capped * 100);
      
      if (pctInt - lastSavedPctRef.current >= 5) {
        lastSavedPctRef.current = pctInt;
        const status = pctInt >= 100 ? 'completed' : 'in_progress';
        updateModuleProgress(String(id), subjectId, pctInt, status).catch(() => {});
        if (sessionIdRef.current) updateStudySession(sessionIdRef.current, 0, 0, false).catch(() => {});

        if (pctInt >= 100 && hasVerifiedAssessment && !hasTakenThisAssessment) {
          Alert.alert(
            "Module Completed! 🎉",
            "You have finished reading. Would you like to take the assessment now?",
            [
              { text: "Later", style: "cancel" },
              { 
                text: "Take Quiz", 
                onPress: () => router.push({ pathname: '/(app)/quiz/[id]', params: { id: assessmentId } }) 
              }
            ]
          );
        }
      }
    }
  };

  const checkScrollability = (contentH: number, layoutH: number) => {
    if (contentH > 0 && layoutH > 0 && contentH <= layoutH + 20) {
      handleProgressUpdate(1);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isPdf && Platform.OS !== 'web') return; 
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    scrollViewHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;

    const scrollableHeight = contentSize.height - layoutMeasurement.height;

    if (scrollableHeight > 0) {
      if (scrollableHeight - contentOffset.y <= 50) {
        handleProgressUpdate(1);
      } else {
        handleProgressUpdate(contentOffset.y / scrollableHeight);
      }
    } else {
      handleProgressUpdate(1);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const inputType = moduleInputType?.toLowerCase();
  const isPdf = inputType === 'pdf' || (!inputType && moduleMaterialUrl?.toLowerCase().endsWith('.pdf'));
  const PdfComponent = Platform.OS !== 'web' ? (() => { try { return require('react-native-pdf').default; } catch { return null; } })() : null;
  const pdfSource = moduleMaterialUrl ? { uri: moduleMaterialUrl, cache: true } : undefined;

  const themeColors = {
    background: isDarkMode ? '#1c1c1c' : '#ffffff',
    textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
    cardBg: isDarkMode ? '#2C2C2C' : '#F4F6F8',
    footerBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    fill: isDarkMode ? '#A38FDB' : '#381E72',
    codeBg: isDarkMode ? '#333' : '#eee',
  };

  const markdownStyles = {
    body: { color: themeColors.textPrimary, fontFamily: Fonts.poppinsRegular, fontSize: 16, lineHeight: 26 },
    heading1: { fontSize: 24, fontFamily: Fonts.poppinsMedium, color: themeColors.fill, marginTop: 20, marginBottom: 10 },
    heading2: { fontSize: 20, fontFamily: Fonts.poppinsMedium, color: themeColors.textPrimary, marginTop: 15, marginBottom: 8 },
    paragraph: { marginBottom: 12 },
    code_inline: { backgroundColor: themeColors.codeBg, color: themeColors.textPrimary, borderRadius: 4 },
  };

  const htmlStyles = {
    body: {
      color: themeColors.textPrimary,
      fontFamily: Fonts.poppinsRegular,
      fontSize: 16,
      lineHeight: 26,
    },
    h1: {
      fontSize: 24,
      fontFamily: Fonts.poppinsMedium,
      color: themeColors.fill,
      marginTop: 20,
      marginBottom: 10,
    },
    h2: {
      fontSize: 20,
      fontFamily: Fonts.poppinsMedium,
      color: themeColors.textPrimary,
      marginTop: 15,
      marginBottom: 8,
    },
    p: {
      marginBottom: 12,
      textAlign: 'justify' as const,
      lineHeight: 26,
    },
    strong: {
      fontFamily: Fonts.poppinsMedium,
      fontWeight: '600',
    },
    code: {
      backgroundColor: themeColors.codeBg,
      color: themeColors.textPrimary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: 'monospace',
    },
  } satisfies Readonly<Record<string, MixedStyleDeclaration>>;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.fill} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={toggleTheme}>
          <Feather name={isDarkMode ? "sun" : "moon"} size={24} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      {isPdf && pdfSource && Platform.OS !== 'web' && PdfComponent ? (
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: themeColors.textPrimary, marginBottom: 10 }]}>{moduleTitle}</Text>
          <PdfComponent
            source={pdfSource}
            onLoadComplete={(numberOfPages: number) => setPdfTotalPages(numberOfPages)}
            onPageChanged={(page: number, numberOfPages: number) => {
              setPdfCurrentPage(page);
              setPdfTotalPages(numberOfPages);
              handleProgressUpdate(page / numberOfPages);
            }}
            style={styles.pdf}
            trustAllCerts={false}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            scrollViewHeightRef.current = h;
            checkScrollability(contentHeightRef.current, h);
          }}
          onContentSizeChange={(w, h) => {
            contentHeightRef.current = h;
            checkScrollability(h, scrollViewHeightRef.current);
          }}
        >
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>{moduleTitle || 'Module'}</Text>
          {moduleAuthor ? <Text style={[styles.author, { color: themeColors.textSecondary }]}>{moduleAuthor}</Text> : null}

          {isPdf && Platform.OS === 'web' ? (
            <View style={{ height: width * 1.5, borderRadius: 8, overflow: 'hidden' }}>
              <iframe src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(moduleMaterialUrl)}`} style={{ width: '100%', height: '100%', border: 'none' } as any} />
            </View>
          ) : isHtmlContent ? (
            <RenderHtml
              contentWidth={width - 48}
              source={{ html: moduleContent }}
              tagsStyles={htmlStyles}
              baseStyle={{ color: themeColors.textPrimary }}
            />
          ) : (
            <Markdown style={markdownStyles}>
              {moduleContent || 'No content available.'}
            </Markdown>
          )}

          {/* Assessment Card */}
          {hasVerifiedAssessment && (
            <View style={[styles.quizSection, { backgroundColor: themeColors.cardBg }]}>
              <View style={styles.quizInfo}>
                <Text style={[styles.quizTitle, { color: themeColors.textPrimary }]}>
                  Module Assessment
                </Text>
                <Text style={[styles.quizDesc, { color: themeColors.textSecondary }]}>
                  {hasTakenThisAssessment 
                    ? "You've already completed this quiz." 
                    : "Test your understanding of this module."}
                </Text>
              </View>
              
              <Pressable 
                style={[styles.quizButton, { opacity: hasTakenThisAssessment ? 0.7 : 1 }]} 
                onPress={() => router.push({ pathname: '/(app)/quiz/[id]', params: { id: assessmentId } })}
              >
                <Text style={styles.quizButtonText}>
                  {hasTakenThisAssessment ? 'Retake' : 'Start Quiz'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <View style={[styles.footer, { backgroundColor: themeColors.footerBg }]}>
        <View style={styles.progressInfo}>
          <Text style={{ fontFamily: Fonts.poppinsMedium, color: themeColors.fill }}>
            {isPdf && PdfComponent 
              ? `Page ${pdfCurrentPage} of ${pdfTotalPages}` 
              : `${Math.round(readingProgress * 100)}% Complete`}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${readingProgress * 100}%`, backgroundColor: themeColors.fill }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#381E72', justifyContent: 'center', alignItems: 'center' },
  iconButton: { padding: 8 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#F5F5F5' },
  title: { fontFamily: Fonts.poppinsMedium, fontSize: 22, textAlign: 'center', marginBottom: 8 },
  author: { fontFamily: Fonts.poppinsRegular, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  quizSection: { marginTop: 40, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quizInfo: { flex: 1, paddingRight: 10 },
  quizTitle: { fontFamily: Fonts.poppinsMedium, fontSize: 16, marginBottom: 4 },
  quizDesc: { fontFamily: Fonts.poppinsRegular, fontSize: 12 },
  quizButton: { backgroundColor: '#381E72', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, flexDirection: 'row', gap: 6, alignItems: 'center' },
  quizButtonText: { color: '#FFF', fontFamily: Fonts.poppinsMedium, fontSize: 14 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowOpacity: 0.1, elevation: 10 },
  progressInfo: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  progressBarTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
});
