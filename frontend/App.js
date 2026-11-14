
import { StatusBar } from 'expo-status-bar';
import AuthNavigator from './src/features/auth/AuthNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AuthNavigator />
    </>
  );
}
