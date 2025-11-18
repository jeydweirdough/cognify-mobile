import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle = "Babycakes" }: HeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Left: Title + Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Right: Profile Image */}
      <Image
        source={require("@/assets/images/profile.png")}
        style={styles.profileImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F7F8FB", // soft background like screenshot
  },

  textContainer: {
    flexDirection: "column",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 2,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 16, // rounded-square like screenshot
  },
});

export default Header;
