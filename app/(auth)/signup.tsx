import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react'; // Import useRef
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // 1. Create refs for all fields except the first one
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    const newErrors = {
      firstName: !firstName,
      lastName: !lastName,
      email: !email,
      password: !password,
      confirmPassword: !confirmPassword
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, firstName, lastName);
    } catch (e: any) {
      console.log("Signup error caught by UI");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create your Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.formContainer}>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="student_psych@cvsu.edu.ph"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                clearError('firstName');
              }}
              autoCapitalize="words"
              placeholderTextColor="#999"

              // Next -> Last Name
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              ref={lastNameRef}
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="student_psych@cvsu.edu.ph"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                clearError('lastName');
              }}
              autoCapitalize="words"
              placeholderTextColor="#999"

              // Next -> Email
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address:</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="student_psych@cvsu.edu.ph"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"

              // Next -> Password
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Set Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Set password</Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="***************"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"

                // Next -> Confirm Password
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={[styles.passwordContainer, errors.confirmPassword && styles.inputError]}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.passwordInput}
                placeholder="***************"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"

                // Go -> Submit
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={THEME.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isLoading}>
                <Text style={styles.loginLink}>Log in.</Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: THEME.white,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.darkGreen,
    textAlign: 'center',
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
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    color: '#666',
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
    marginTop: 25,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#000',
  },
  loginLink: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});