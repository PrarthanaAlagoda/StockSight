
import { COLLECTIONS } from '../../utils/constants';

import {
  createDocument,
  getDocuments,
  getDocumentById,
  getFilteredDocuments,
  updateDocument,
  deleteDocument,
} from '../../services/firestore';

import { createReportModel } from '../../models/report';

// Create a report
export async function createReport(reportData) {
  return createDocument(COLLECTIONS.REPORT, reportData);
}

// Generate a report using the report model
export async function generateReport({
  inspectionId,
  warehouseId,
  generatedBy,
  totalProducts = 0,
  totalExpectedQuantity = 0,
  totalVerifiedQuantity = 0,
  totalMissingQuantity = 0,
  totalDamagedQuantity = 0,
}) {
  const reportData = createReportModel({
    inspectionId,
    warehouseId,
    generatedBy,
    totalProducts,
    totalExpectedQuantity,
    totalVerifiedQuantity,
    totalMissingQuantity,
    totalDamagedQuantity,
  });

  return createReport(reportData);
}

// Get all reports
export async function getAllReports() {
  return getDocuments(COLLECTIONS.REPORT);
}

// Get a report by ID
export async function getReportById(reportId) {
  return getDocumentById(COLLECTIONS.REPORT, reportId);
}

// Get reports by warehouse
export async function getReportsByWarehouse(warehouseId) {
  return getFilteredDocuments(COLLECTIONS.REPORT, [
    { field: 'warehouse_id', operator: '==', value: warehouseId },
  ], 'generated_at');
}

// Get reports by inspection
export async function getReportByInspection(inspectionId) {
  const reports = await getFilteredDocuments(COLLECTIONS.REPORT, [
    { field: 'inspection_id', operator: '==', value: inspectionId },
  ]);

  return reports.length > 0 ? reports[0] : null;
}

// Update a report
export async function updateReport(reportId, data) {
  return updateDocument(COLLECTIONS.REPORT, reportId, data);
}

// Delete a report
export async function deleteReport(reportId) {
  return deleteDocument(COLLECTIONS.REPORT, reportId);
}
