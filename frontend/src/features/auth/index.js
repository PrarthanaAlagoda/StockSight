
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';

import { auth, db } from '../../services/firebase';
import { COLLECTIONS } from '../../utils/constants';
import { createEmployeeModel } from '../../models/user';

// Generate unique STAFF employee ID
async function generateStaffId() {
  const counterRef = doc(db, 'COUNTER', 'STAFF');

  const staffNumber = await runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    const currentNumber = counterSnapshot.exists()
      ? counterSnapshot.data().lastNumber
      : 0;

    const nextNumber = currentNumber + 1;

    transaction.set(counterRef, {
      lastNumber: nextNumber,
    });

    return nextNumber;
  });

  return `STAFF${String(staffNumber).padStart(3, '0')}`;
}

// Register a new STAFF account
export async function registerUser({
  name,
  email,
  password,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const user = credential.user;

  try {
    const employeeId = await generateStaffId();

    const employeeData = createEmployeeModel({
      employeeId,
      uid: user.uid,
      roleId: 'STAFF',
      name,
      email: normalizedEmail,
    });

    // Firestore document ID = Firebase UID
    await setDoc(
      doc(db, COLLECTIONS.EMPLOYEE, user.uid),
      employeeData
    );

    return {
      user,
      employee: employeeData,
    };
  } catch (error) {
    await user.delete().catch(() => {});
    throw error;
  }
}

// Login existing employee
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  const user = credential.user;

  try {
    const employee = await getEmployeeProfile(user.uid);

    if (!employee) {
      throw new Error('Employee profile not found.');
    }

    if (employee.status !== 'ACTIVE') {
      throw new Error('Your employee account is inactive.');
    }

    if (!['STAFF', 'MANAGER'].includes(employee.role_id)) {
      throw new Error('Invalid employee role.');
    }

    return {
      user,
      employee,
      role: employee.role_id,
    };
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}

// Retrieve employee profile using Firebase UID
export async function getEmployeeProfile(uid) {
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.EMPLOYEE, uid)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    uid: snapshot.id,
  };
}

// Logout
export async function logoutUser() {
  await signOut(auth);
}
