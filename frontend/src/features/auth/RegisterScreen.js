
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

export default function RegisterScreen({
  onRegister,
  onNavigateToLogin,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please complete all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }

    if (onRegister) {
      onRegister({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } else {
      Alert.alert(
        'Registration UI',
        'Account registration will be connected later.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F7F0" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>◈</Text>
            </View>
            <Text style={styles.logoText}>StockSight</Text>
            <Text style={styles.tagline}>
              Smart Warehouse Inspection
            </Text>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join StockSight to manage and monitor warehouse inspections.
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Register your account</Text>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA69E"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
             
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA69E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#9CA69E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA69E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.loginLink}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 StockSight. All rights reserved.
            </Text>
            <Text style={styles.footerSubtext}>
              Inspect. Capture. Report.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7F0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 25,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#145C3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#10452F',
    letterSpacing: -0.7,
  },
  tagline: {
    fontSize: 12,
    color: '#718176',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  welcomeSection: {
    marginBottom: 22,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#123E2C',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#77847A',
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#183F2C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173F2D',
    marginBottom: 23,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#294A37',
    marginBottom: 8,
  },
  inputContainer: {
    height: 53,
    borderWidth: 1,
    borderColor: '#DFE7DF',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#FCFDFC',
  },
  inputIcon: {
    fontSize: 18,
    color: '#397B57',
    marginRight: 11,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#243D2E',
    height: '100%',
  },
  eyeButton: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  eyeText: {
    fontSize: 12,
    color: '#24764A',
    fontWeight: '700',
  },
  registerButton: {
    height: 55,
    backgroundColor: '#145C3B',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    marginLeft: 12,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 13,
    color: '#7B877E',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17643E',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#87938A',
    fontSize: 11,
  },
  footerSubtext: {
    color: '#145C3B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },
});

