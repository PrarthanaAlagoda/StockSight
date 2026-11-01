
import { serverTimestamp } from 'firebase/firestore';

export const createReportModel = ({
  inspectionId,
  warehouseId,
  generatedBy,
  totalProducts = 0,
  totalExpectedQuantity = 0,
  totalVerifiedQuantity = 0,
  totalMissingQuantity = 0,
  totalDamagedQuantity = 0,
  status = 'GENERATED',
}) => ({
  inspection_id: inspectionId,
  warehouse_id: warehouseId,
  generated_by: generatedBy,
  total_products: totalProducts,
  total_expected_quantity: totalExpectedQuantity,
  total_verified_quantity: totalVerifiedQuantity,
  total_missing_quantity: totalMissingQuantity,
  total_damaged_quantity: totalDamagedQuantity,
  status,
  generated_at: serverTimestamp(),
});
