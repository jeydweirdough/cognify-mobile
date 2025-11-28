import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react'; // Import useRef
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const [errors, setErrors] = useState({ email: false, password: false });

  const { login } = useAuth();

  // 1. Create a ref for the password input
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    const newErrors = {
      email: !email,
      password: !password,
    };

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      console.log("Login error caught by UI");
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
                errors.email && styles.inputError
              ]}
              placeholder="student_psych@cvsu.edu.ph"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: false }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"

              // 2. Add keyboard navigation props
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.email && <Text style={styles.errorText}>Email is required</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.passwordContainer,
              errors.password && styles.inputError
            ]}>
              <TextInput
                // 3. Attach the ref here
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="***************"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors(prev => ({ ...prev, password: false }));
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"

                // 4. Set return key to submit
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
            {errors.password && <Text style={styles.errorText}>Password is required</Text>}
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
    marginTop: 4,
    marginLeft: 4,
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