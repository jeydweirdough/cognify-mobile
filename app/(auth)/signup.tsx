// app/(auth)/sign-up.tsx (Fixed)
import { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { Link } from 'expo-router';
import { Colors, Fonts } from '../../constants/cognify-theme';
import { FontAwesome } from '@expo/vector-icons';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 👇 FIX 1: Add state for first_name and last_name
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignUp = async () => {
    // 👇 FIX 2: Check for missing first_name and last_name
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Missing Fields', 'Please enter your full name, email, and password.');
      return;
    }
    
    // Simple password validation
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      // 👇 FIX 3: Pass firstName and lastName to signup
      await signup(email, password, firstName, lastName);
      // On success, the useAuth hook will show an alert and handle navigation
    } catch (e: any) {
      // The alert is already shown by lib/auth.tsx
      console.log("Signup error caught by UI");
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
        <Text style={styles.title}>Create Account</Text>

        {/* 👇 FIX 4: Add Input for First Name */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          placeholderTextColor={Colors.placeholder}
        />
        
        {/* 👇 FIX 5: Add Input for Last Name */}
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          placeholderTextColor={Colors.placeholder}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
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
          onPress={handleSignUp}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.buttonText}>Create</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable disabled={isLoading}>
              <Text style={styles.createText}>Log In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
// ... (rest of the StyleSheet is unchanged)
// ...
// ...
// ...
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
    fontFamily: Fonts.poppinsMedium,
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
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.primary,
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
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: Colors.white,
    marginLeft: 5,
  },
});