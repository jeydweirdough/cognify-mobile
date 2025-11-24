import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  StatusBar 
} from "react-native"; 
import { useAuth } from "@/lib/auth"; 

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();

  const subtitle =
    user?.first_name || user?.last_name
      ? `Hello, ${user.first_name || ""}`.trim() 
      : "Hello, User";

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F7F8FB" 
      />

      {/*Main Content View */}
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Image
          source={require("@/assets/images/profile.png")}
          style={styles.profileImage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F7F8FB",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F7F8FB", 
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
    borderRadius: 16,
  },
});

export default Header;