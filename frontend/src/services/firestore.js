import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

import { db } from './firebase';
import { COLLECTIONS } from '../utils/constants';
import { createWarehouseModel } from '../models/warehouse';
import { createRoleModel } from '../models/user';

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

// Get a role by its ID
export async function getRoleById(roleId) {
  return getDocumentById(COLLECTIONS.ROLE, roleId);
}

// Create a role
export async function createRole({
  roleName,
  description = '',
}) {
  const roleRef = doc(collection(db, COLLECTIONS.ROLE));

  const roleData = createRoleModel({
    roleId: roleRef.id,
    roleName,
    description,
  });

  await setDoc(roleRef, roleData);

  return roleRef.id;
}

// Get all roles
export async function getAllRoles() {
  return getDocuments(COLLECTIONS.ROLE);
}

// Employee functions

// Get all employees
export async function getAllEmployees() {
  return getDocuments(COLLECTIONS.EMPLOYEE);
}

// Get an employee by role
export async function getEmployeesByRole(roleId) {
  return getFilteredDocuments(COLLECTIONS.EMPLOYEE, [
    { field: 'role_id', operator: '==', value: roleId },
  ]);
}

// Update employee details
export async function updateEmployee(employeeId, data) {
  return updateDocument(
    COLLECTIONS.EMPLOYEE,
    employeeId,
    data
  );
}

// Update employee status
export async function updateEmployeeStatus(employeeId, status) {
  return updateDocument(COLLECTIONS.EMPLOYEE, employeeId, {
    status,
  });
}

// Warehouse functions
export async function getAllWarehouses() {
  return getDocuments(COLLECTIONS.WAREHOUSE);
}

export async function getShelvesByWarehouse(warehouseId) {
  return getFilteredDocuments(COLLECTIONS.SHELF, [
    { field: 'warehouse_id', operator: '==', value: warehouseId },
  ]);
}

export async function getSectionsByShelf(shelfId) {
  return getFilteredDocuments(COLLECTIONS.SHELF_SECTION, [
    { field: 'shelf_id', operator: '==', value: shelfId },
  ]);
}

// Create a warehouse
export async function createWarehouse(warehouseData) {
  return createDocument(COLLECTIONS.WAREHOUSE, warehouseData);
}

// Create a warehouse using the warehouse model
export async function addWarehouse({
  name,
  location,
  status = 'ACTIVE',
}) {
  const warehouseData = createWarehouseModel({
    name,
    location,
    status,
  });

  return createWarehouse(warehouseData);
}

// Product functions
export async function getAllCategories() {
  return getDocuments(COLLECTIONS.CATEGORY);
}

export async function getAllProducts() {
  return getDocuments(COLLECTIONS.PRODUCT);
}

export async function getProductByBarcode(barcode) {
  const products = await getFilteredDocuments(COLLECTIONS.PRODUCT, [
    { field: 'barcode', operator: '==', value: barcode },
  ]);

  return products.length > 0 ? products[0] : null;
}

// Create a category
export async function createCategory(categoryData) {
  return createDocument(COLLECTIONS.CATEGORY, categoryData);
}

// Create a product
export async function createProduct(productData) {
  return createDocument(COLLECTIONS.PRODUCT, productData);
}

// Get products by category
export async function getProductsByCategory(categoryId) {
  return getFilteredDocuments(COLLECTIONS.PRODUCT, [
    { field: 'category_id', operator: '==', value: categoryId },
  ]);
}

// Update product details
export async function updateProduct(productId, data) {
  return updateDocument(COLLECTIONS.PRODUCT, productId, data);
}

// Update product status
export async function updateProductStatus(productId, status) {
  return updateDocument(COLLECTIONS.PRODUCT, productId, {
    status,
  });
}

// Delete a product
export async function deleteProduct(productId) {
  return deleteDocument(COLLECTIONS.PRODUCT, productId);
}

// Inventory functions
export async function getInventoryBySection(sectionId) {
  return getFilteredDocuments(COLLECTIONS.INVENTORY, [
    { field: 'section_id', operator: '==', value: sectionId },
  ]);
}

// Create an inventory record
export async function createInventory(inventoryData) {
  return createDocument(COLLECTIONS.INVENTORY, inventoryData);
}

// Get inventory for a product
export async function getInventoryByProduct(productId) {
  return getFilteredDocuments(COLLECTIONS.INVENTORY, [
    { field: 'product_id', operator: '==', value: productId },
  ]);
}

// Update inventory details
export async function updateInventory(inventoryId, data) {
  return updateDocument(COLLECTIONS.INVENTORY, inventoryId, data);
}

// Update expected quantity
export async function updateExpectedQuantity(inventoryId, quantity) {
  return updateDocument(COLLECTIONS.INVENTORY, inventoryId, {
    expected_quantity: quantity,
  });
}

// Inspection functions
export async function getInspectionsByEmployee(employeeId) {
  return getFilteredDocuments(COLLECTIONS.INSPECTION, [
    { field: 'employee_id', operator: '==', value: employeeId },
  ]);
}

export async function getPendingInspections() {
  return getFilteredDocuments(COLLECTIONS.INSPECTION, [
    { field: 'status', operator: '==', value: 'PENDING' },
  ]);
}

// Create an inspection
export async function createInspection(inspectionData) {
  return createDocument(COLLECTIONS.INSPECTION, inspectionData);
}

// Get an inspection by ID
export async function getInspectionById(inspectionId) {
  return getDocumentById(COLLECTIONS.INSPECTION, inspectionId);
}

// Update inspection details
export async function updateInspection(inspectionId, data) {
  return updateDocument(
    COLLECTIONS.INSPECTION,
    inspectionId,
    data
  );
}

// Update inspection status
export async function updateInspectionStatus(inspectionId, status) {
  return updateDocument(COLLECTIONS.INSPECTION, inspectionId, {
    status,
  });
}

// Get inspections by status
export async function getInspectionsByStatus(status) {
  return getFilteredDocuments(COLLECTIONS.INSPECTION, [
    { field: 'status', operator: '==', value: status },
  ]);
}

// Notification functions
export async function getNotificationsByEmployee(employeeId) {
  return getFilteredDocuments(COLLECTIONS.NOTIFICATION, [
    { field: 'employee_id', operator: '==', value: employeeId },
  ]);
}

// Image functions

// Create an image record
export async function createImage(imageData) {
  return createDocument(COLLECTIONS.IMAGE, imageData);
}

// Get images for an inspection
export async function getImagesByInspection(inspectionId) {
  return getFilteredDocuments(COLLECTIONS.IMAGE, [
    { field: 'inspection_id', operator: '==', value: inspectionId },
  ]);
}

// Delete an image record
export async function deleteImage(imageId) {
  return deleteDocument(COLLECTIONS.IMAGE, imageId);
}

// Observation functions

// Create an observation
export async function createObservation(observationData) {
  return createDocument(COLLECTIONS.OBSERVATION, observationData);
}

// Get observations for an inspection
export async function getObservationsByInspection(inspectionId) {
  return getFilteredDocuments(COLLECTIONS.OBSERVATION, [
    { field: 'inspection_id', operator: '==', value: inspectionId },
  ]);
}

// Update an observation
export async function updateObservation(observationId, data) {
  return updateDocument(
    COLLECTIONS.OBSERVATION,
    observationId,
    data
  );
}

// Analysis functions

// Create an analysis record
export async function createAnalysis(analysisData) {
  return createDocument(COLLECTIONS.ANALYSIS, analysisData);
}

// Get analysis by inspection
export async function getAnalysisByInspection(inspectionId) {
  const analyses = await getFilteredDocuments(COLLECTIONS.ANALYSIS, [
    { field: 'inspection_id', operator: '==', value: inspectionId },
  ]);

  return analyses.length > 0 ? analyses[0] : null;
}

// Update analysis details
export async function updateAnalysis(analysisId, data) {
  return updateDocument(
    COLLECTIONS.ANALYSIS,
    analysisId,
    data
  );
}