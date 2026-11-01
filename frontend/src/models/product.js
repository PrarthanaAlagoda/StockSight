import { serverTimestamp } from 'firebase/firestore';

// Category model
export const createCategoryModel = ({
  categoryId,
  categoryName,
  description = '',
}) => ({
  category_id: categoryId,
  category_name: categoryName,
  description,
});

// Product model
export const createProductModel = ({
  productId,
  categoryId,
  productName,
  barcode,
  description = '',
  status = 'ACTIVE',
}) => ({
  product_id: productId,
  category_id: categoryId,
  product_name: productName,
  barcode,
  description,
  status,
  created_at: serverTimestamp(),
});