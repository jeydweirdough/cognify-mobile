// @/components/diagnostic/AssessmentStartScreen.tsx

import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Assuming Fonts import is available from parent context/structure
import { Fonts } from "../../constants/cognify-theme";

const { width } = Dimensions.get("window");

// --- START SCREEN COMPONENT ---
export const AssessmentStartScreen = ({
  onStartPress,
}: {
  onStartPress: () => void;
}) => {
  return (
    <View style={startStyles.container}>
      <Text style={startStyles.title}>
        Let's Get Started{"\n"}with Your Diagnostic Assessment
      </Text>
      <View style={startStyles.illustrationContainer}>
        <Image
          source={require("@/assets/images/got_this.png")}
          style={{ width: 140, height: 140, resizeMode: "contain" }}
        />
      </View>
      <Text style={startStyles.subtitle}>You got this!</Text>
      <Text style={startStyles.description}>
        This 4-subject, 20-item diagnostic test will assess your current
        knowledge base across key areas. You will have 20 minutes to
        complete it. Your results will guide your personalized study plan.
      </Text>
      <TouchableOpacity style={startStyles.button} onPress={onStartPress}>
        <Text style={startStyles.buttonText}>START NOW!</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- STYLES ---
const startStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 26,
    color: "#4CAF50",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 30,
  },
  illustrationContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 22,
    color: "#6E3D84",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts.poppinsRegular,
    marginHorizontal: 10,
    fontSize: 15,
    color: "#333333",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#6E3D84",
    paddingVertical: 16,
    width: "100%",
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#6E3D84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontFamily: Fonts.poppinsMedium,
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: 1,
  },
});