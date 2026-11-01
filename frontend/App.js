import { StatusBar } from 'expo-status-bar';
import StaffDashboard from './src/features/staff/index.js';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <StaffDashboard />
    </>
  );
}