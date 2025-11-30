// @/components/diagnostic/QuizScreen.tsx

import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

interface QuestionData {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface ThemeColors {
  background: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  optionBorder: string;
  optionSelectedBg: string;
  questionCardBg: string;
  questionCardText: string;
  questionCardBorder: string;
}

interface QuizScreenProps {
  QUIZ_DATA_LENGTH: number;
  currentQuestionIndex: number;
  currentQuestion?: QuestionData;
  selectedOptionIndex: number | null;
  progressPercent: number;
  isSubjectStart: boolean;
  timeLeft: number;
  isDarkMode: boolean;
  themeColors: ThemeColors;
  formatTime: (seconds: number) => string;
  handleNext: () => void;
  setSelectedOptionIndex: (index: number) => void;
  setIsDarkMode: (isDark: boolean) => void;
  routerBack: () => void;
}

// --- QUIZ SCREEN COMPONENT ---
export const QuizScreen: React.FC<QuizScreenProps> = ({
  QUIZ_DATA_LENGTH,
  currentQuestionIndex,
  currentQuestion,
  selectedOptionIndex,
  progressPercent,
  isSubjectStart,
  timeLeft,
  isDarkMode,
  themeColors,
  formatTime,
  handleNext,
  setSelectedOptionIndex,
  setIsDarkMode,
  routerBack,
}) => {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            Alert.alert("Exit?", "Progress will be lost", [
              { text: "Cancel" },
              { text: "Exit", onPress: routerBack },
            ])
          }
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Diagnostic Assessment
        </Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Feather
            name={isDarkMode ? "sun" : "moon"}
            size={24}
            color={themeColors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.fixedTopContainer}>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDarkMode ? "#333" : "#E0E0E0" },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.timerContainer}>
          <View
            style={[
              styles.timerPill,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.optionBorder,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={timeLeft < 120 ? "red" : themeColors.textSecondary} // Red warning at 2 mins
            />
            <Text
              style={[
                styles.timerText,
                { color: timeLeft < 120 ? "red" : themeColors.textPrimary },
              ]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Subject Card (Conditional Display) */}
        {isSubjectStart && currentQuestion?.subject && (
          <View
            style={[
              styles.subjectCard,
              {
                backgroundColor: themeColors.optionSelectedBg,
              },
            ]}
          >
            <Text style={styles.subjectCardText}>
              {currentQuestion?.subject}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.questionCard,
            {
              backgroundColor: themeColors.questionCardBg,
              borderColor: themeColors.questionCardBorder,
            },
          ]}
        >
          <Text style={[styles.questionCounter, { color: "#333" }]}>
            Question {currentQuestionIndex + 1} of {QUIZ_DATA_LENGTH}
          </Text>
          <Text
            style={[
              styles.questionText,
              { color: themeColors.questionCardText },
            ]}
          >
            {currentQuestion?.question ?? ""}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {(currentQuestion?.options ?? []).map((option, index) => {
            const isSelected = selectedOptionIndex === index;
            return (
              <Pressable
                key={index}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected
                      ? themeColors.optionSelectedBg
                      : themeColors.cardBg,
                    borderColor: isSelected
                      ? themeColors.optionSelectedBg
                      : themeColors.optionBorder,
                  },
                ]}
                onPress={() => setSelectedOptionIndex(index)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected
                        ? "#FFF"
                        : themeColors.textSecondary,
                    },
                  ]}
                >
                  {isSelected && <View style={styles.radioFill} />}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? "#FFF" : themeColors.textPrimary },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { backgroundColor: themeColors.background }]}
      >
        <Pressable
          style={[
            styles.primaryButton,
            selectedOptionIndex === null && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={selectedOptionIndex === null}
        >
          <Text style={styles.primaryButtonText}>
            {currentQuestionIndex === QUIZ_DATA_LENGTH - 1
              ? "Submit Assessment"
              : "Next Question"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

// Merged styles for this component (Quiz Screen Styles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#381E72",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: { padding: 8 },
  headerTitle: { fontFamily: Fonts.poppinsMedium, fontSize: 18 },
  fixedTopContainer: { paddingBottom: 10 },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  progressBarTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#381E72",
    borderRadius: 4,
  },
  timerContainer: { alignItems: "center", marginBottom: 5 },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  timerText: { fontFamily: Fonts.poppinsMedium, fontSize: 14 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },

  // Subject Card Style
  subjectCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  subjectCardText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },

  questionCard: {
    borderRadius: 12,
    padding: 25,
    marginBottom: 30,
    borderWidth: 1,
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCounter: {
    position: "absolute",
    top: 16,
    left: 20,
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    opacity: 0.7,
  },
  questionText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
    marginTop: 10,
  },
  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionText: { fontFamily: Fonts.poppinsRegular, fontSize: 16, flex: 1 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  footer: { padding: 24, position: "absolute", bottom: 0, left: 0, right: 0 },
  primaryButton: {
    backgroundColor: "#381E72",
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#381E72",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#B0B0B0",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#FFF",
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
  },
});
