
import { COLLECTIONS } from '../../utils/constants';
import {
  createDocument,
  getFilteredDocuments,
  updateDocument,
  deleteDocument,
} from '../../services/firestore';

import { createNotificationModel } from '../../models/notification';

// Create a notification
export async function createNotification({
  employeeId,
  inspectionId,
  title,
  message,
  type = 'INSPECTION_UPDATE',
}) {
  const notificationData = createNotificationModel({
    employeeId,
    inspectionId,
    title,
    message,
    type,
  });

  return createDocument(COLLECTIONS.NOTIFICATION, notificationData);
}

// Get all notifications for an employee
export async function getNotificationsByEmployee(employeeId) {
  return getFilteredDocuments(COLLECTIONS.NOTIFICATION, [
    { field: 'employee_id', operator: '==', value: employeeId },
  ], 'created_at');
}

// Get unread notifications for an employee
export async function getUnreadNotifications(employeeId) {
  return getFilteredDocuments(COLLECTIONS.NOTIFICATION, [
    { field: 'employee_id', operator: '==', value: employeeId },
    { field: 'is_read', operator: '==', value: false },
  ], 'created_at');
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId) {
  return updateDocument(COLLECTIONS.NOTIFICATION, notificationId, {
    is_read: true,
  });
}

// Mark all notifications as read for an employee
export async function markAllNotificationsAsRead(employeeId) {
  const notifications = await getUnreadNotifications(employeeId);

  const updates = notifications.map((notification) =>
    markNotificationAsRead(notification.id)
  );

  await Promise.all(updates);
}

// Delete a notification
export async function removeNotification(notificationId) {
  return deleteDocument(COLLECTIONS.NOTIFICATION, notificationId);
}
