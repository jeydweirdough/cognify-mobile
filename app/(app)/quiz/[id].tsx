import { Feather, Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Fonts } from '../../../constants/cognify-theme';

const { width } = Dimensions.get('window');

const MOCK_QUESTIONS = [
    {
        id: 1,
        question: "Who is considered the author of the module 'Introduction to Industrial and Organizational Psychology'?",
        options: ["Sigmund Freud", "Ronald E. Riggo", "B.F. Skinner", "Carl Jung"],
        correctIndex: 1,
    },
    {
        id: 2,
        question: "Which of the following best describes the main focus of the reading material?",
        options: ["Clinical therapy techniques", "Workplace behavior and organizations", "Child development", "Abnormal psychology"],
        correctIndex: 1,
    },
    {
        id: 3,
        question: "According to the text, the content includes...",
        options: ["Lorem ipsum placeholder text", "Detailed case studies", "Mathematical formulas", "Historical dates"],
        correctIndex: 0,
    },
    {
        id: 4,
        question: "What happens when you finish this quiz?",
        options: [" nothing", "The module is marked as 100% complete", "The app crashes", "You restart the level"],
        correctIndex: 1,
    },
    {
        id: 5,
        question: "Industrial Psychology applies psychological principles to...",
        options: ["The workplace", "Family dynamics", "School systems", "Criminal justice"],
        correctIndex: 0,
    }
];

export default function QuizScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();

    // --- STATE ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // --- HIDE BOTTOM TABS LOGIC ---
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

    // --- THEME COLORS ---
    const themeColors = {
        background: isDarkMode ? '#121212' : '#F8F9FA',
        cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
        textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
        optionBorder: isDarkMode ? '#333333' : '#E0E0E0',
        optionSelectedBg: '#381E72',
        optionSelectedText: '#FFFFFF',

        // MERGED: Question Card Colors (Adaptive)
        questionCardBg: isDarkMode ? '#2C2C2C' : '#EAFEFF', // Dark grey in dark mode, Beige in light
        questionCardText: isDarkMode ? '#FFD700' : '#5C5428', // Gold/Yellow text
        questionCardBorder: isDarkMode ? '#444' : '#333',
    };

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100;

    // --- HANDLERS ---
    const handleOptionPress = (index: number) => {
        setSelectedOptionIndex(index);
    };

    const handleNext = () => {
        if (selectedOptionIndex === null) return;

        if (selectedOptionIndex === currentQuestion.correctIndex) {
            setScore(prev => prev + 1);
        }

        if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptionIndex(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setIsQuizFinished(true);
        if (!(global as any).MODULE_PROGRESS) (global as any).MODULE_PROGRESS = {};
        (global as any).MODULE_PROGRESS[id] = 100;
    };

    // --- RENDER: RESULT SCREEN ---
    if (isQuizFinished) {
        const finalScore = selectedOptionIndex === currentQuestion.correctIndex ? score + 1 : score;
        const passed = finalScore >= (MOCK_QUESTIONS.length * 0.6);

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.resultContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name={passed ? "trophy" : "alert-circle"}
                            size={60}
                            color="#381E72"
                        />
                    </View>

                    <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]}>
                        {passed ? "Quiz Completed!" : "Nice Try!"}
                    </Text>

                    <Text style={[styles.resultScore, { color: themeColors.textSecondary }]}>
                        You scored {finalScore} out of {MOCK_QUESTIONS.length}
                    </Text>

                    <Pressable
                        style={styles.primaryButton}
                        onPress={() => {
                            router.navigate('/(app)/subject/[id]');
                        }}
                    >
                        <Text style={styles.primaryButtonText}>Back to Module</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // --- RENDER: QUIZ SCREEN ---
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </Pressable>

                <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
                    Quiz
                </Text>

                <Pressable style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
                    <Feather name={isDarkMode ? "sun" : "moon"} size={24} color={themeColors.textPrimary} />
                </Pressable>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                    {currentQuestionIndex + 1}/{MOCK_QUESTIONS.length}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* MERGED: Question Card (Styled like Assessment) */}
                <View style={[
                    styles.questionCard,
                    {
                        backgroundColor: themeColors.questionCardBg,
                        borderColor: themeColors.questionCardBorder
                    }
                ]}>
                    <Text style={[styles.questionCounter, { color: themeColors.textSecondary }]}>
                        Question {currentQuestionIndex + 1}
                    </Text>
                    <Text style={[styles.questionText, { color: themeColors.questionCardText }]}>
                        {currentQuestion.question}
                    </Text>
                </View>

                {/* Options (Styled like Quiz) */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOptionIndex === index;
                        return (
                            <Pressable
                                key={index}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: isSelected ? themeColors.optionSelectedBg : themeColors.cardBg,
                                        borderColor: isSelected ? themeColors.optionSelectedBg : themeColors.optionBorder,
                                    }
                                ]}
                                onPress={() => handleOptionPress(index)}
                            >
                                <View style={[
                                    styles.radioCircle,
                                    { borderColor: isSelected ? '#FFF' : themeColors.textSecondary }
                                ]}>
                                    {isSelected && <View style={styles.radioFill} />}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    { color: isSelected ? '#FFF' : themeColors.textPrimary }
                                ]}>
                                    {option}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Button */}
            <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
                <Pressable
                    style={[
                        styles.primaryButton,
                        selectedOptionIndex === null && styles.disabledButton
                    ]}
                    onPress={handleNext}
                    disabled={selectedOptionIndex === null}
                >
                    <Text style={styles.primaryButtonText}>
                        {currentQuestionIndex === MOCK_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question"}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </Pressable>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    iconButton: {
        padding: 8,
    },
    headerTitle: {
        fontFamily: Fonts.bold,
        fontSize: 18,
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#381E72',
        borderRadius: 4,
    },
    progressText: {
        fontFamily: Fonts.semiBold,
        fontSize: 14,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    // MERGED: Updated Question Styles
    questionCard: {
        borderRadius: 12,
        padding: 25,
        marginBottom: 30,
        borderWidth: 1,
        minHeight: 180,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questionCounter: {
        position: 'absolute',
        top: 16,
        left: 20,
        fontFamily: Fonts.regular,
        fontSize: 12,
        opacity: 0.7,
    },
    questionText: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginTop: 10,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    optionText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        flex: 1,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioFill: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFF',
    },
    footer: {
        padding: 24,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    primaryButton: {
        backgroundColor: '#381E72',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#381E72',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: '#FFF',
        fontFamily: Fonts.bold,
        fontSize: 16,
    },
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3EEF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultTitle: {
        fontFamily: Fonts.bold,
        fontSize: 28,
        marginBottom: 8,
    },
    resultScore: {
        fontFamily: Fonts.regular,
        fontSize: 18,
        marginBottom: 40,
    },
});