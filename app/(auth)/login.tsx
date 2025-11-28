import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/auth';

const THEME = {
  darkGreen: '#2F4F4F',
  textGray: '#666666',
  borderColor: '#A9A9A9',
  buttonPurple: '#3E206D',
  white: '#FFFFFF',
  errorRed: '#FF3B30',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState({ email: '', password: '' });

  const { login } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    // 1. Reset Errors
    setErrorMsg({ email: '', password: '' });

    // 2. Client-side Validation
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!isValid) {
      setErrorMsg(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      console.log("Login Error:", e.response?.status, e.response?.data);

      const status = e.response?.status;
      const data = e.response?.data;
      const detail = data?.detail;

      // --- HANDLE 422 VALIDATION ERRORS ---
      if (status === 422 && Array.isArray(detail)) {
        let hasMappedError = false;

        detail.forEach((err: any) => {
          const fieldName = err.loc?.[1];

          if (fieldName === 'email') {
            // Check if backend says "value is not a valid email address"
            setErrorMsg(prev => ({ ...prev, email: 'Invalid email format' }));
            hasMappedError = true;
          }
          if (fieldName === 'password') {
            // 👇 FIXED: Ignore backend message, always say "Invalid password"
            setErrorMsg(prev => ({ ...prev, password: 'Invalid password' }));
            hasMappedError = true;
          }
        });

        if (!hasMappedError) {
          Alert.alert('Login Failed', 'Please check your inputs.');
        }
        return;
      }

      // --- HANDLE 400/401 (Wrong Credentials) ---
      if (status === 401 || status === 400) {
        // If the error seems related to credentials, usually we flag the password
        setErrorMsg(prev => ({ ...prev, password: 'Invalid password' }));
      }
      else if (status === 404) {
        // User not found
        setErrorMsg(prev => ({ ...prev, email: 'Account not found' }));
      }
      else {
        // Fallback
        const fallbackMsg = typeof detail === 'string' ? detail : e.message;
        Alert.alert('Login Failed', fallbackMsg || 'An unexpected error occurred.');
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in with your account.</Text>
        </View>

        <View style={styles.formContainer}>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                !!errorMsg.email && styles.inputError
              ]}
              placeholder="student_psych@cvsu.edu.ph"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg.email) setErrorMsg(prev => ({ ...prev, email: '' }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            {!!errorMsg.email && <Text style={styles.errorText}>{errorMsg.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.passwordContainer,
              !!errorMsg.password && styles.inputError
            ]}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="***************"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMsg.password) setErrorMsg(prev => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {!!errorMsg.password && <Text style={styles.errorText}>{errorMsg.password}</Text>}
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={THEME.white} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable disabled={isLoading}>
                <Text style={styles.signUpLink}>Sign up.</Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: THEME.white,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.darkGreen,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textGray,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: THEME.errorRed,
    borderWidth: 1,
  },
  errorText: {
    color: THEME.errorRed,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: THEME.buttonPurple,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    color: THEME.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#000',
  },
  signUpLink: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});