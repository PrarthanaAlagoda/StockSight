
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import { registerUser, loginUser } from './index';
import { auth } from '../../services/firebase';

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loading, setLoading] = useState(false);

  // Registration
  const handleRegister = async ({ name, email, password }) => {
    try {
      setLoading(true);

      const result = await registerUser({ name, email, password });

      Alert.alert(
        'Registration Successful',
        `Welcome to StockSight!\nEmployee ID: ${result.employee.employee_id}`,
        [
          {
            text: 'Continue to Login',
            onPress: () => setCurrentScreen('login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);

      const result = await loginUser(email, password);

      Alert.alert(
        'Login Successful',
        `Welcome back, ${result.employee.name}!\nRole: ${result.role}`
      );

      // Dashboard navigation will be added later.
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async (email) => {
    if (!email) {
      Alert.alert('Email Required', 'Enter your email address first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email.'
      );
    } catch (error) {
      Alert.alert('Password Reset Failed', error.message);
    }
  };

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onNavigateToRegister={() => setCurrentScreen('register')}
    />
  );
}
