import { serverTimestamp } from 'firebase/firestore';


// Inventory model
export const createInventoryModel = ({
  inventoryId,
  productId,
  sectionId,
  expectedQuantity,
}) => ({
  inventory_id: inventoryId,
  product_id: productId,
  section_id: sectionId,
  expected_quantity: expectedQuantity,
});

// Inspection model
export const createInspectionModel = ({
  inspectionId,
  employeeId,
  sectionId,
  status = 'PENDING',
  observation = '',
}) => ({
  inspection_id: inspectionId,
  employee_id: employeeId,
  section_id: sectionId,
  status,
  observation,
  submitted_at: serverTimestamp(),
});

// Image model
export const createImageModel = ({
  imageId,
  inspectionId,
  imageUrl,
  publicId = '',
}) => ({
  image_id: imageId,
  inspection_id: inspectionId,
  image_url: imageUrl,
  public_id: publicId,
  uploaded_at: serverTimestamp(),
});

// Observation model
export const createObservationModel = ({
  observationId,
  inspectionId,
  employeeId,
  description,
  type = 'TEXT',
}) => ({
  observation_id: observationId,
  inspection_id: inspectionId,
  employee_id: employeeId,
  description,
  type,
  created_at: serverTimestamp(),
});

// Analysis model
export const createAnalysisModel = ({
  analysisId,
  inspectionId,
  expectedQuantity,
  verifiedQuantity,
  damagedQuantity = 0,
  missingQuantity = 0,
  comments = '',
}) => ({
  analysis_id: analysisId,
  inspection_id: inspectionId,
  expected_quantity: expectedQuantity,
  verified_quantity: verifiedQuantity,
  damaged_quantity: damagedQuantity,
  missing_quantity: missingQuantity,
  comments,
  analysed_at: serverTimestamp(),
});