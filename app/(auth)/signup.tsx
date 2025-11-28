import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
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

  // State to track specific error messages
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    // 1. Reset Errors
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    // 2. Client-Side Validation
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // -- Check Empty Fields --
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    // -- Password Validation --
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      // 👇 NEW: Check for minimum 8 characters here
      newErrors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    }

    // -- Password Mismatch Check --
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // 3. Submit to Backend
    setIsLoading(true);
    try {
      await signup(email, password, firstName, lastName);
    } catch (e: any) {
      console.log("Signup Error:", e.response?.status, e.response?.data);

      const status = e.response?.status;
      const data = e.response?.data;
      const detail = data?.detail;

      // --- Handle Backend Validation Errors (422) ---
      if (status === 422 && Array.isArray(detail)) {
        detail.forEach((err: any) => {
          const fieldName = err.loc?.[1];

          if (fieldName === 'email') {
            setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
          }
          else if (fieldName === 'password') {
            // If backend complains about password complexity
            setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters & contain 1 uppercase letter.' }));
          }
          else if (fieldName === 'first_name') {
            setErrors(prev => ({ ...prev, firstName: 'Invalid first name' }));
          }
          else if (fieldName === 'last_name') {
            setErrors(prev => ({ ...prev, lastName: 'Invalid last name' }));
          }
        });
      }
      // --- Handle Duplicate Email (400/409) ---
      else if (status === 400 || status === 409) {
        if (typeof detail === 'string' && detail.toLowerCase().includes('exist')) {
          setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
        } else {
          Alert.alert('Signup Failed', detail || 'Could not create account.');
        }
      }
      else {
        // Fallback
        Alert.alert('Signup Failed', detail || 'An unexpected error occurred.');
      }

    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
              style={[styles.input, !!errors.firstName && styles.inputError]}
              placeholder="First Name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                clearError('firstName');
              }}
              autoCapitalize="words"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />
            {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              ref={lastNameRef}
              style={[styles.input, !!errors.lastName && styles.inputError]}
              placeholder="Last Name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                clearError('lastName');
              }}
              autoCapitalize="words"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address:</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, !!errors.email && styles.inputError]}
              placeholder="student_psych@cvsu.edu.ph"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Set Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Set password</Text>
            <View style={[styles.passwordContainer, !!errors.password && styles.inputError]}>
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
            {/* Display Password Error here */}
            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={[styles.passwordContainer, !!errors.confirmPassword && styles.inputError]}>
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
            {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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