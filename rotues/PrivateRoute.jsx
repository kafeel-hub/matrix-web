import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateLayout from "../components/Drawer/PrivateLayout";

const PrivateRoute = ({ title, element }) => {
  const accessToken = useSelector((state) => state.auth?.accessToken || state.auth?.token || "");
  const requiresContextSelection = useSelector((state) => state.auth?.requiresContextSelection);
  if (accessToken) return <PrivateLayout title={title}>{element}</PrivateLayout>;
  return <Navigate to={requiresContextSelection ? "/company-branch" : "/"} replace />;
};
export default PrivateRoute;
