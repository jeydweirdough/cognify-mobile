import { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  SafeAreaView,
  ActivityIndicator, // Import ActivityIndicator
  Alert, // Import Alert
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { Link } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons'; // For the logo

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      // On success, the useAuth hook will handle navigation
    } catch (e: any) {
      // --- FIX: Catch the error from useAuth to stop loading ---
      // The alert is already shown by lib/auth.tsx
      console.log("Login error caught by UI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FontAwesome name="smile-o" size={60} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Welcome!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email" // Changed from "Username" to "Email" for clarity
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={Colors.placeholder}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Colors.placeholder}
        />

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </Pressable>

        <Text style={styles.forgotText}>Forgot password?</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable disabled={isLoading}>
              <Text style={styles.createText}>Create</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
  forgotText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.white,
  },
  createText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
    marginLeft: 5,
  },
});