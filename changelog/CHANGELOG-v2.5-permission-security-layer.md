# React v2.5 Permission / Security Layer

- Stores screen/action permissions returned by login/bootstrap.
- Added centralized permission helpers and usePermission hook.
- PrivateRoute supports module + screen View authorization and application-style Access Denied rendering.
- SideDrawer can filter menu items by module/screen permission.
- Chart of Accounts is the first reference implementation: hidden when View is denied; Add/Edit controls are disabled according to legacy permissions.
- Security remains enforced by the API; React checks are UX/navigation controls.
