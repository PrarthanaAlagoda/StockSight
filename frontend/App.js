
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

import { registerUser } from './src/features/auth';

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);

      const result = await registerUser({
        name: 'Test Staff',
        email: 'YOUR_NEW_TEST_EMAIL@gmail.com',
        password: 'TestStaff123!',
      });

      Alert.alert(
        'Registration Successful',
        `Employee ID: ${result.employee.employee_id}\nUID: ${result.user.uid}`
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StockSight Auth Test</Text>

      <Button
        title={loading ? 'Registering...' : 'Test Registration'}
        onPress={handleRegister}
        disabled={loading}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
