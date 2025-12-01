import { FONT_FAMILY, PRIMARY_COLOR  } from "@/constants/cognify-theme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function ReviewCognifyCard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <Pressable style={styles.takenSection} android_ripple={{ color: "rgba(255,255,255,0.15)" }}>
        <ActivityIndicator color="#FFF" />
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.takenSection} android_ripple={{ color: "rgba(255,255,255,0.15)" }}>
      <View style={styles.takenBackdrop} />
      <View style={styles.takenContentRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.takenTitle}>Review with Cognify</Text>
          <Text style={styles.takenSubtitle}>One study tip: Space out your review sessions to boost retention!</Text>
        </View>
        <Image source={require("@/assets/icons/bullseye.png")} style={{ width: 60, height: 70, marginLeft: 12 }} resizeMode="contain" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  takenSection: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    overflow: "hidden",
    height: 140,
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  takenBackdrop: {
    position: "absolute",
    right: -20,
    top: 10,
    width: Platform.OS === "ios" ? 120 : 110,
    height: Platform.OS === "ios" ? 120 : 110,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  takenContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  takenTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: "500",
    color: "#FFF",
  },
  takenSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: "rgba(255, 245, 245, 0.85)",
    marginTop: 6,
    lineHeight: 18,
  },
});
