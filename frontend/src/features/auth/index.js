
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } from 'firebase/auth';
  
  import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  
  import { auth, db } from '../../services/firebase';
  
  // Register an employee account.
  // roleId must come from a trusted, approved registration process.
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
      await setDoc(doc(db, 'EMPLOYEE', user.uid), {
        employee_id: user.uid,
        role_id: roleId,
        name: name.trim(),
        email: normalizedEmail,
        status: 'ACTIVE',
        created_at: serverTimestamp(),
      });
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
  
  // Retrieve the employee profile
  export async function getEmployeeProfile(employeeId) {
    const snapshot = await getDoc(
      doc(db, 'EMPLOYEE', employeeId)
    );
  
    if (!snapshot.exists()) {
      return null;
    }
  
    return snapshot.data();
  }
  
  // Sign out
  export async function logoutUser() {
    await signOut(auth);
  }
  