
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyALpvZdDiheYMi0vBSe8KC_2wwFKDtTyUk',
  authDomain: 'stocksight-2759e.firebaseapp.com',
  projectId: 'stocksight-2759e',
  storageBucket: 'stocksight-2759e.firebasestorage.app',
  messagingSenderId: '313181973120',
  appId: '1:313181973120:web:647a0c5599c0ab8591d465',
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Reuse Auth if it has already been initialized
    return getAuth(app);
  }
})();

export const db = getFirestore(app);

export default app;





