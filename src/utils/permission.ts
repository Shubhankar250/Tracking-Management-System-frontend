export interface Permission {
  permission: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export const getPermission = (
  permissions: Permission[],
  name: string,
): Permission | undefined => {
  return permissions.find((p) => p.permission === name);
};

export const canRead = (permissions: Permission[], name: string) =>
  !!getPermission(permissions, name)?.read;

export const canWrite = (permissions: Permission[], name: string) => {
  if (!permissions || permissions.length === 0) return false; // ✅ SAFE
  return permissions.find((p) => p.permission === name)?.write ?? false;
};

export const canDelete = (permissions: Permission[], name: string) => {
  if (!permissions || permissions.length === 0) return false;
  return permissions.find((p) => p.permission === name)?.delete ?? false;
};
