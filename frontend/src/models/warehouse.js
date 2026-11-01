import { serverTimestamp } from 'firebase/firestore';

// Warehouse model
export const createWarehouseModel = ({
  name,
  location,
  status = 'ACTIVE',
}) => ({
  name,
  location,
  status,
  created_at: serverTimestamp(),
});

// Shelf model
export const createShelfModel = ({
  shelfId,
  warehouseId,
  shelfCode,
  shelfName,
  qrCode = '',
  status = 'ACTIVE',
}) => ({
  shelf_id: shelfId,
  warehouse_id: warehouseId,
  shelf_code: shelfCode,
  shelf_name: shelfName,
  qr_code: qrCode,
  status,
});

// Shelf section model
export const createShelfSectionModel = ({
  sectionId,
  shelfId,
  sectionCode,
  qrCode = '',
  description = '',
}) => ({
  section_id: sectionId,
  shelf_id: shelfId,
  section_code: sectionCode,
  qr_code: qrCode,
  description,
});