import React from "react";
import { View, Text, StyleSheet } from "react-native";
// Assuming Fonts is correctly imported and contains your font definitions
import { Fonts } from "@/constants/cognify-theme";
// Import an icon library, e.g., FontAwesome from react-native-vector-icons
import Icon from 'react-native-vector-icons/FontAwesome'; 

interface MotivationCardProps {
  quote?: string;
}

export default function MotivationCard({
  quote = "\"Don't let what you cannot do interfere with what you can do\"",
}: MotivationCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🧠 Dopamine Booster</Text>
      </View>
      <View style={styles.quoteContainer}>
        {/* The Pin Icon */}
        <View style={styles.pin}>
            <Icon name="map-pin" size={20} color="#E74C3C" /> 
            {/* Using a map-pin icon. You can choose a different one like "thumb-tack" or a custom image */}
        </View>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#156781", 
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: "#FDFFB8", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    width: "80%",
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.lexendDecaMedium,
    color: "#FFF",
  },
  quoteContainer: {
    backgroundColor: "#F6F1E9", 
    borderRadius: 8,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.25, 
    shadowRadius: 5,
    elevation: 6,
    transform: [{ rotate: '-1.5deg' }], 
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)', 
    marginTop: 5,
    position: 'relative', 
  },
  quoteText: {
    fontSize: 14, 
    fontFamily: Fonts.lexendDecaRegular,
    textAlign: "center",
    color: "#1E3A5F", 
    lineHeight: 24,
  },
  // --- New Pin Styles ---
  pin: {
    position: 'absolute', 
    top: -10,             
    left: '50%',         
    marginLeft: 0,     
    transform: [{ rotate: '5deg' }], 
    zIndex: 1, 
  }
});