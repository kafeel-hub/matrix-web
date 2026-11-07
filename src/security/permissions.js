export const normalizePermissionName = (value = "") => String(value).replace(/[^a-z0-9]/gi, "").toUpperCase();

export const getScreenPermission = (permissions = [], screenIdentifier) => {
  const wanted = normalizePermissionName(screenIdentifier);
  return permissions.find((p) =>
    normalizePermissionName(p.screenNo) === wanted ||
    normalizePermissionName(p.screenName) === wanted
  ) || null;
};

export const hasModule = (modules, moduleName) => {
  if (!moduleName) return true;
  if (!modules) return false;
  const aliases = { Admin: "administration", File: "files", Finance: "finance", Inventory: "inventory", Purchasing: "purchases", Sales: "sales", FixedAssets: "fixedAssets", Tools: "tools" };
  const key = aliases[moduleName] || moduleName;
  return modules[key] === true || modules[key.charAt(0).toLowerCase() + key.slice(1)] === true;
};

export const canScreen = (permissions, screenName, action = "view") => {
  if (!screenName) return true;
  const p = getScreenPermission(permissions, screenName);
  if (!p) return false;
  const keys = { view: "canView", add: "canAdd", edit: "canEdit", delete: "canDelete", show: "canShow", print: "canPrint" };
  return p[keys[action] || "canView"] === true;
};
