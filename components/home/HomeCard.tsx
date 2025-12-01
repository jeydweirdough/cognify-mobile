import { Fonts } from "@/constants/cognify-theme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from "react-native";

export default function HomeCard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={{ height: 100, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#FFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.textBlock}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Cognify reminds you:</Text>
          </View>
          <Text style={styles.title}>One page a day{"\n"}keeps the anxiety{"\n"}away. 🌿</Text>
        </View>

        <Image
          source={require("@/assets/images/reminds.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1B3C53",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#8d8d96ff",
    padding: 20,
    marginTop: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contentRow: {
    flexDirection: "row",
   alignItems: "flex-end",
  },
  textBlock: {
    flex: 1.5,
    paddingLeft: 1,
    
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#F5E5E1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  pillText: {
    color: "#4f4d4dff",
    fontFamily: Fonts.poppinsMedium,
    fontSize: 9,
  },
  title: {
    color: "#e9e9e9ff",
    fontFamily: Fonts.lexendDecaMedium,
    paddingHorizontal: 10,
    fontSize: 14,
    lineHeight: 26,
    
  },
 illustration: {
  position: "absolute",
  right: -10,      // overlaps outside card
  bottom: -25,      // slight float
  height: 150,     // bigger to match floating look
  width: 140,
  zIndex: 10,      // sits on top
},

});
