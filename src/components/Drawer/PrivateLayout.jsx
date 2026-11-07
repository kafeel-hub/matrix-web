// components/PrivateLayout.js
import React, { useState } from "react";
import { Box, CssBaseline, Toolbar, useMediaQuery } from "@mui/material";
import Header from "./Header";
import SideDrawer from "./SideDrawer";
import Loader from "../Loader/Loader";

const drawerWidth = 240;
const collapsedWidth = 60;

const PrivateLayout = ({ title, children }) => {
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
    setIsDrawerCollapsed(false);
  };
  const closeDrawer = () => setOpenDrawer(false);
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header
        title="Dashboard"
        drawerWidth={isDrawerCollapsed ? collapsedWidth : drawerWidth}
        isDrawerCollapsed={isDrawerCollapsed}
        toggleDrawer={toggleDrawer}
      />
      <SideDrawer
        isCollapsed={isDrawerCollapsed}
        setIsCollapsed={setIsDrawerCollapsed}
        logOut={() => console.log("Logout")}
        isMobile={isMobile}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
      />
      <Box
        sx={{
          flexGrow: 1,
          padding: "12px 12px",
          width: `calc(100% - ${
            isDrawerCollapsed ? collapsedWidth : drawerWidth
          }px)`,
          // mt: {
          //   xs: "72px",
          //   sm: "78px",
          //   md: "92px",
          //   lg: "105px",
          // },
          mt: 8,
          transition: "width 0.3s",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PrivateLayout;
