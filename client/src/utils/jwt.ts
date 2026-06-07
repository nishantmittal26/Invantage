export const getPermissionsFromToken = (token: string | null): string[] => {
  if (!token) return [];
  try {
    const payloadBase64 = token.split('.')[1];
    // Use decodeURIComponent and escape to handle UTF-8 characters safely
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const decodedPayload = JSON.parse(payloadJson);
    const permissions = decodedPayload.permission || decodedPayload.permissions;
    if (!permissions) return [];
    return Array.isArray(permissions) ? permissions : [permissions];
  } catch (e) {
    console.error('Failed to parse JWT token permissions:', e);
    return [];
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const decodedPayload = JSON.parse(payloadJson);
    const exp = decodedPayload.exp;
    if (!exp) return false;
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};
