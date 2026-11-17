
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

export default function LoginScreen({
  onLogin,
  onNavigateToRegister,
  onForgotPassword,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (onLogin) {
      onLogin({
        email: email.trim().toLowerCase(),
        password,
      });
    } else {
      Alert.alert('Login UI', 'Authentication will be connected later.');
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword(email.trim());
    } else {
      Alert.alert(
        'Forgot Password',
        'Password recovery will be connected during Firebase integration.'
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
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue managing your warehouse inspections.
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Login to your account</Text>

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
                placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Login</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </TouchableOpacity>

            {/* Registration Link */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.registerLink}> Register</Text>
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
    paddingTop: 35,
    paddingBottom: 25,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 38,
  },
  logoBox: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#145C3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 43,
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
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#123E2C',
    marginBottom: 9,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#77847A',
    lineHeight: 22,
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
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#294A37',
    marginBottom: 9,
  },
  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: '#DFE7DF',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 21,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 24,
  },
  forgotText: {
    color: '#17643E',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    height: 55,
    backgroundColor: '#145C3B',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 23,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    marginLeft: 12,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  registerText: {
    fontSize: 13,
    color: '#7B877E',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17643E',
  },
  footer: {
    alignItems: 'center',
    marginTop: 35,
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
