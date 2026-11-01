import { serverTimestamp } from 'firebase/firestore';

export const createNotificationModel = ({
  notificationId,
  employeeId,
  inspectionId,
  title,
  message,
  type = 'INSPECTION_UPDATE',
  isRead = false,
}) => ({
  notification_id: notificationId,
  employee_id: employeeId,
  inspection_id: inspectionId,
  title,
  message,
  type,
  is_read: isRead,
  created_at: serverTimestamp(),
});