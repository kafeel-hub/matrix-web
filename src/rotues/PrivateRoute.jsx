import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateLayout from "../components/Drawer/PrivateLayout";
import { hasModule, canScreen } from "../security/permissions";
import { Box, Paper, Typography } from "@mui/material";

const PrivateRoute = ({ title, element, module, screen }) => {
  const accessToken = useSelector((state) => state.auth?.accessToken || state.auth?.token || "");
  const requiresContextSelection = useSelector((state) => state.auth?.requiresContextSelection);
  const modules = useSelector((state) => state.auth?.modules);
  const permissions = useSelector((state) => state.auth?.permissions || []);
  if (accessToken) {
    const allowed = hasModule(modules, module) && canScreen(permissions, screen, "view");
    if (!allowed) return <PrivateLayout title="Access Denied"><Box sx={{p:3}}><Paper sx={{p:4,textAlign:"center"}}><Typography variant="h5" fontWeight={800}>Access Denied</Typography><Typography color="text.secondary" sx={{mt:1}}>You do not have permission to access this screen.</Typography></Paper></Box></PrivateLayout>;
    return <PrivateLayout title={title}>{element}</PrivateLayout>;
  }
  return <Navigate to={requiresContextSelection ? "/company-branch" : "/"} replace />;
};
export default PrivateRoute;
