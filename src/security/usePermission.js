import { useSelector } from "react-redux";
import { getScreenPermission } from "./permissions";
export default function usePermission(screenName) {
  const permissions = useSelector((s) => s.auth?.permissions || []);
  const p = getScreenPermission(permissions, screenName);
  return {
    canView: !!p?.canView, canAdd: !!p?.canAdd, canEdit: !!p?.canEdit,
    canDelete: !!p?.canDelete, canShow: !!p?.canShow, canPrint: !!p?.canPrint, permission: p
  };
}
