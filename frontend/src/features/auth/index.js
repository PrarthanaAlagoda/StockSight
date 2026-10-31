
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from '../../services/firebase';
import { COLLECTIONS } from '../../utils/constants';
import { createEmployeeModel } from '../../models/user';

// Register an employee account
export async function registerUser({
  name,
  email,
  password,
  roleId,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const user = credential.user;

  try {
    const employeeData = createEmployeeModel({
      employeeId: user.uid,
      roleId,
      name,
      email: normalizedEmail,
    });

    await setDoc(
      doc(db, COLLECTIONS.EMPLOYEE, user.uid),
      employeeData
    );
  } catch (error) {
    await user.delete().catch(() => {});
    throw error;
  }

  return user;
}

// Sign in an existing employee
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  return credential.user;
}

// Retrieve employee profile
export async function getEmployeeProfile(employeeId) {
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.EMPLOYEE, employeeId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    employee_id: snapshot.id,
    ...snapshot.data(),
  };
}

// Sign out
export async function logoutUser() {
  await signOut(auth);
}
