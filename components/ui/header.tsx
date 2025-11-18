import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  title: string;
}
const Header = ({ title }: HeaderProps) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#EFEFEF",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});

export default Header;
