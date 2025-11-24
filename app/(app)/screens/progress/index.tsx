import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AchievementsCard } from "@/components/progress/Achievements";
import { ProgressOverviewCard } from "@/components/progress/Overview";
import { ReadinessCard } from "@/components/progress/ReadinessCard";
import Header from "@/components/ui/header";

const Colors = {
  background: "#F8F8F8",
  white: "#FFFFFF",
  text: "#333333",
  primary: "#6A2A94",
};

const Fonts = {
  semiBold: "LexendDeca-Medium",
  regular: "LexendDeca-Regular",
};


const MOCK_READINESS_DATA = {
  title: "Readiness Level",
  subtitle: "Your current pass probability",
  percentage: 39,
};


export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
   // Load custom font
    const [fontsLoaded] = useFonts({
      "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
      "LexendDeca-Regular": require("@/assets/fonts/LexendDeca-Regular.ttf"),
    });
  

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
 <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>

      <Header title="Progress" />


      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <MotivationCard /> */}
        <ReadinessCard data={MOCK_READINESS_DATA} />
        <AchievementsCard />
        <ProgressOverviewCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
});
