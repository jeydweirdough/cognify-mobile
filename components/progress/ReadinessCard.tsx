import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "../subjects/CircularProgress";

const Colors = {
  white: "#FFFFFF",
};

const Fonts = {
  regular: "Poppins-Regular",
};

export const ReadinessCard = ({ data }: any) => {
  return (
    <View style={styles.readinessCard}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.readinessTitle}>{data.title}</Text>
        <Text style={styles.readinessSubtitle}>{data.subtitle}</Text>
      </View>

      <CircularProgress percentage={data.percentage} />
    </View>
  );
};
const styles = StyleSheet.create({
  readinessCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6E3D84",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  readinessTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.white,
  },
  readinessSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#D4B8E3",
    marginTop: 4,
    flexShrink: 1, // wrap long text
  },
});