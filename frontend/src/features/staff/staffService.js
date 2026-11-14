
import {
  getFilteredDocuments,
  getDocuments,
  getDocumentById,
  updateDocument,
} from '../../services/firestore';

import { COLLECTIONS } from '../../utils/constants';
import { createInspectionModel } from '../../models/inspection';

import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../services/firebase';

// ==========================================
// PRODUCT FUNCTIONS
// ==========================================

// Get all active products
export async function getProducts() {
  try {
    const products = await getDocuments(COLLECTIONS.PRODUCT);

    return products.filter(
      (product) => product.status === 'ACTIVE'
    );
  } catch (error) {
    console.error('Error retrieving products:', error);
    throw error;
  }
}

// Get a product by its document ID
export async function getProductById(documentId) {
  try {
    return await getDocumentById(
      COLLECTIONS.PRODUCT,
      documentId
    );
  } catch (error) {
    console.error('Error retrieving product:', error);
    throw error;
  }
}

// ==========================================
// INVENTORY FUNCTIONS
// ==========================================

// Get inventory records for a specific product
export async function getInventoryByProductId(productId) {
  try {
    return await getFilteredDocuments(
      COLLECTIONS.INVENTORY,
      [
        {
          field: 'product_id',
          operator: '==',
          value: productId,
        },
      ]
    );
  } catch (error) {
    console.error('Error retrieving product inventory:', error);
    throw error;
  }
}

// Get inventory records for a specific shelf section
export async function getInventoryBySectionId(sectionId) {
  try {
    return await getFilteredDocuments(
      COLLECTIONS.INVENTORY,
      [
        {
          field: 'section_id',
          operator: '==',
          value: sectionId,
        },
      ]
    );
  } catch (error) {
    console.error('Error retrieving section inventory:', error);
    throw error;
  }
}

// ==========================================
// INSPECTION FUNCTIONS
// ==========================================

// Create a new staff inspection
export async function createInspection(inspectionData) {
  try {
    const inspectionRef = doc(
      collection(db, COLLECTIONS.INSPECTION)
    );

    const inspectionRecord = createInspectionModel({
      ...inspectionData,
      inspectionId: inspectionRef.id,
    });

    await setDoc(inspectionRef, inspectionRecord);

    return inspectionRef.id;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
}

// ==========================================
// OBSERVATION FUNCTIONS
// ==========================================

// Save a staff observation
export async function saveObservation({
  inspectionId,
  employeeId,
  description,
  type = 'TEXT',
}) {
  try {
    const observationRef = await addDoc(
      collection(db, COLLECTIONS.OBSERVATION),
      {
        observation_id: '',
        inspection_id: inspectionId,
        employee_id: employeeId,
        description,
        type,
        created_at: serverTimestamp(),
      }
    );

    await updateDocument(
      COLLECTIONS.OBSERVATION,
      observationRef.id,
      { observation_id: observationRef.id }
    );

    return observationRef.id;
  } catch (error) {
    console.error('Error saving observation:', error);
    throw error;
  }
}

// ==========================================
// INSPECTION HISTORY
// ==========================================

// Get inspection history for a staff member
export async function getInspectionHistory(employeeId) {
  try {
    const inspections = await getFilteredDocuments(
      COLLECTIONS.INSPECTION,
      [
        {
          field: 'employee_id',
          operator: '==',
          value: employeeId,
        },
      ]
    );

    return inspections.sort((a, b) => {
      const dateA = a.submitted_at?.toMillis?.() || 0;
      const dateB = b.submitted_at?.toMillis?.() || 0;

      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error retrieving inspection history:', error);
    throw error;
  }
}

// ==========================================
// SUBMIT INSPECTION
// ==========================================

// Submit an inspection for manager review
export async function submitInspection(inspectionId) {
  try {
    await updateDocument(
      COLLECTIONS.INSPECTION,
      inspectionId,
      {
        status: 'PENDING_REVIEW',
        submitted_at: serverTimestamp(),
      }
    );

    return true;
  } catch (error) {
    console.error('Error submitting inspection:', error);
    throw error;
  }
}


export async function testProductRetrieval() {
  try {
    const products = await getProducts();

    console.log('Products retrieved from Firebase:', products);

    return products;
  } catch (error) {
    console.error('Product retrieval failed:', error);
    throw error;
  }
}