import Header from "@/components/ui/header";
import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
   <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Notifications" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>New</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="book-open" size={20} color="#FF9F1C" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>New Study Material Uploaded</Text>
            <Text style={styles.itemSubtitle}>Developmental Psychology • A new lecture has been added.</Text>
          </View>
          <Text style={styles.itemTime}>2h</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="bell" size={20} color="#E83F5B" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Diagnostic Result Available</Text>
            <Text style={styles.itemSubtitle}>View your subject recommendations based on your assessment.</Text>
          </View>
          <Text style={styles.itemTime}>1d</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="check-circle" size={20} color="#2E7D32" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Quiz Due Tomorrow</Text>
            <Text style={styles.itemSubtitle}>Abnormal Psychology • Anxiety Disorders module quiz is due.</Text>
          </View>
          <Text style={styles.itemTime}>1d</Text>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>Earlier</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="file-text" size={20} color="#6A2A94" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Subject Progress Updated</Text>
            <Text style={styles.itemSubtitle}>Industrial-Organizational Psychology • Reading progress saved.</Text>
          </View>
          <Text style={styles.itemTime}>3d</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="award" size={20} color="#FFC107" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Analytics Report Generated</Text>
            <Text style={styles.itemSubtitle}>Your subject performance analytics have been refreshed.</Text>
          </View>
          <Text style={styles.itemTime}>6d</Text>
        </View>

        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Feather name="clock" size={20} color="#999999" />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Profile Updated</Text>
            <Text style={styles.itemSubtitle}>Your account details were successfully updated.</Text>
          </View>
          <Text style={styles.itemTime}>13d</Text>
        </View>
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
  sectionHeaderWrap: {
    paddingVertical: 12,
  },
  sectionHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#7A7A7A",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F7F7F7",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#777777",
  },
  itemTime: {
    fontSize: 12,
    color: "#999999",
    marginLeft: 12,
  },
});
