import React from "react";
import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";

const Fonts = {
  regular: "System",
  semiBold: "System",
  bold: "System",
};

const Colors = {
  text: "#333333",
  white: "#FFFFFF",
};

const images: any = {
  "1": require("@/assets/images/psych_asses.png"),
  "2": require("@/assets/images/dev_psych.png"),
  "3": require("@/assets/images/abnormal_psych.png"),
  "4": require("@/assets/images/io_psych.png"),
};

export const SubjectCard = ({ data }: any) => {
  return (
    <Pressable
      style={styles.subjectCard}
      onPress={() => router.push(`/(app)/subject/${data.id}`)}
    >
      <Text style={styles.subjectName}>{data.name}</Text>

      <View style={styles.subjectContentRow}>

        <View style={[styles.subjectIconContainer, { backgroundColor: data.iconBgColor }]}>
          <Image
            source={images[data.id]}
            style={styles.subjectIconImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.subjectDetailsColumn}>
          <View style={styles.descriptionRow}>
            <Text style={styles.subjectDescription}>{data.description}</Text>
            <Text style={styles.subjectPercentage}>{data.percentage}%</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${data.percentage}%`, backgroundColor: data.iconColor },
                ]}
              />
            </View>
          </View>
        </View>

      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  subjectCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  subjectName: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  subjectContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subjectDetailsColumn: {
    flex: 1,
    marginLeft: 15,
  },
  subjectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectIconImage: {
    width: 40,
    height: 40,
  },
  descriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectDescription: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
    marginRight: 10,
  },
  subjectPercentage: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
  },
  progressBarContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAEAEA",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
