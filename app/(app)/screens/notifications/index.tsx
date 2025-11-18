import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

const Colors = {
  background: "#F8F8F8",
  white: "#FFFFFF",
  text: "#333333",
  primary: "#6A2A94",
};

const Fonts = {
  semiBold: "LexendDeca-Medium",
};

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "LexendDeca-Medium": require("@/assets/fonts/LexendDeca-Medium.ttf"),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}></ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#EFEFEF",
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
});
