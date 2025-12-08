import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => (
  <SafeAreaView style={styles.safeArea}>
    
    <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFF" 
    />
    
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F7F8FB", 
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 0.3, 
    borderColor: "#000000", 
    backgroundColor: "#F7F8FB", 
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default Header;