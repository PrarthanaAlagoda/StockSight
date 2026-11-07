
import { serverTimestamp } from 'firebase/firestore';

export const createNotificationModel = ({
  employeeId,
  inspectionId,
  title,
  message,
  type = 'INSPECTION_UPDATE',
  isRead = false,
}) => ({
  employee_id: employeeId,
  inspection_id: inspectionId,
  title,
  message,
  type,
  is_read: isRead,
  created_at: serverTimestamp(),
});
