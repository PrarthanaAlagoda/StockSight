import { serverTimestamp } from 'firebase/firestore';

// Role document structure
export const createRoleModel = ({
  roleId,
  roleName,
  description = '',
}) => ({
  role_id: roleId,
  role_name: roleName,
  description,
});

// Employee document structure
export const createEmployeeModel = ({
  employeeId,
  roleId,
  name,
  email,
  status = 'ACTIVE',
}) => ({
  employee_id: employeeId,
  role_id: roleId,
  name: name.trim(),
  email: email.trim().toLowerCase(),
  status,
  created_at: serverTimestamp(),
});