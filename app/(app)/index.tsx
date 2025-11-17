import React from "react";
import { View, ScrollView } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// --- COMPONENT IMPORTS ---
import Header from "@/components/home/Header";
import DailyPractice from "@/components/home/DailyPractice";
import AssessmentTest from "@/components/home/AssessmentTest";
import RecommendedCard from "@/components/home/RecommendedCard";
import ContinueReading from "@/components/home/ContinueReading";

// --- KEEP SPLASH SCREEN UNTIL FONTS LOADED ---
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, marginTop: -10 }}>
          <DailyPractice />
          <AssessmentTest />
          <RecommendedCard />
          <ContinueReading />
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}
