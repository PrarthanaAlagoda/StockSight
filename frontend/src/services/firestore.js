
import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

import { db } from './firebase';

// Create a document
export async function createDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

// Get all documents from a collection
export async function getDocuments(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Get one document by ID
export async function getDocumentById(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// Update a document
export async function updateDocument(collectionName, documentId, data) {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);
}

// Delete a document
export async function deleteDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

// Get documents using filters and sorting
export async function getFilteredDocuments(
  collectionName,
  filters = [],
  sortField = null
) {
  const collectionRef = collection(db, collectionName);

  const constraints = filters.map(({ field, operator, value }) =>
    where(field, operator, value)
  );

  if (sortField) {
    constraints.push(orderBy(sortField));
  }

  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}
