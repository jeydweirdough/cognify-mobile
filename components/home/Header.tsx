import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_FAMILY, BACKGROUND_COLOR } from "@/constants/cognify-theme";

export default function Header() {
  return (
    <View style={styles.header}>
      <SafeAreaView style={styles.headerContentSafeArea}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Day to Learn!</Text>
            <Text style={styles.username}>Hi, Babycakes</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100?img=5" }}
              style={styles.avatar}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 0,
    backgroundColor: BACKGROUND_COLOR,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    elevation: 5,
  },
  headerContentSafeArea: {
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: "700",
    color: "#383333ff",
    marginBottom: 4,
  },
  username: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "#383333ff",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
