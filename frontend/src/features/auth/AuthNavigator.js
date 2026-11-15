
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { sendPasswordResetEmail } from 'firebase/auth';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import { registerUser, loginUser, logoutUser } from './index';
import { auth } from '../../services/firebase';

import StaffDashboard from '../staff';
import ManagerDashboardScreen from '../manager/screens/ManagerDashboardScreen';
import PendingQueueScreen from '../manager/screens/PendingQueueScreen';
import InspectionReviewScreen from '../manager/screens/InspectionReviewScreen';
import VerifyFinaliseScreen from '../manager/screens/VerifyFinaliseScreen';

const ManagerStack = createNativeStackNavigator();

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [employee, setEmployee] = useState(null);
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

      setEmployee(result.employee);
      setUserRole(result.role);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setEmployee(null);
      setUserRole(null);
      setCurrentScreen('login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
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

  // STAFF Dashboard
  if (userRole === 'STAFF') {
    return (
      <StaffDashboard
        onLogout={handleLogout}
        employee={employee}
      />
    );
  }

  // MANAGER Dashboard
  if (userRole === 'MANAGER') {
    return (
      <NavigationContainer>
        <ManagerStack.Navigator
          initialRouteName="ManagerDashboard"
          screenOptions={{ headerShown: false }}
        >
          <ManagerStack.Screen name="ManagerDashboard">
            {(props) => (
              <ManagerDashboardScreen
                {...props}
                onLogout={handleLogout}
              />
            )}
          </ManagerStack.Screen>

          <ManagerStack.Screen
            name="PendingQueue"
            component={PendingQueueScreen}
          />

          <ManagerStack.Screen
            name="InspectionReview"
            component={InspectionReviewScreen}
          />

          <ManagerStack.Screen
            name="VerifyFinalise"
            component={VerifyFinaliseScreen}
          />
        </ManagerStack.Navigator>
      </NavigationContainer>
    );
  }

  // Authentication Screens
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
