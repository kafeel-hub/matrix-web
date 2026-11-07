// import React, { useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   IconButton,
//   Typography,
//   Box,
// } from "@mui/material";
// import HomeIcon from "@mui/icons-material/Home";
// import BusinessIcon from "@mui/icons-material/Business";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
// import DashboardIcon from "@mui/icons-material/Dashboard";

// const drawerWidth = 240;

// const DashboardLayout = () => {
//   const [theme, setTheme] = useState("light");
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);
//     document.documentElement.setAttribute("data-theme", newTheme);
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       {/* Sidebar */}
//       <Drawer
//         variant="permanent"
//         open={sidebarOpen}
//         sx={{
//           width: sidebarOpen ? drawerWidth : 70,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: sidebarOpen ? drawerWidth : 70,
//             transition: "width 0.3s ease-in-out",
//             backgroundColor: "var(--background-color)",
//             color: "var(--text-color)",
//           },
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             onClick={toggleSidebar}
//             sx={{
//               color: "var(--text-color)",
//               "&:hover": {
//                 backgroundColor: "rgba(255, 255, 255, 0.2)",
//                 color: "var(--text-color)",
//               },
//             }}
//           >
//             <MenuOpenIcon />
//           </IconButton>
//         </Toolbar>
//         <List>
//           {["Dashboard", "Branches", "Profile"].map((text, index) => (
//             <ListItem button key={text}>
//               <ListItemIcon
//                 sx={{
//                   color: "var(--text-color)",
//                 }}
//               >
//                 {index === 0 ? (
//                   <HomeIcon />
//                 ) : index === 1 ? (
//                   <BusinessIcon />
//                 ) : (
//                   <AccountCircleIcon />
//                 )}
//               </ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItem>
//           ))}
//         </List>
//       </Drawer>

//       {/* Top Navbar */}
//       <AppBar
//         position="fixed"
//         sx={{
//           zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure navbar stays on top of the drawer
//           marginLeft: sidebarOpen ? drawerWidth : 70,
//           width: `calc(100% - ${sidebarOpen ? drawerWidth : 70}px)`,
//           transition: "margin-left 0.3s ease-in-out",
//           backgroundColor: "var(--background-color)",
//           color: "var(--text-color)",
//           borderBottom: "1px solid var(--border-color)",
//         }}
//       >
//         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//           {/* Theme toggle button on the left */}
//           <IconButton
//             onClick={toggleTheme}
//             sx={{
//               color: "var(--text-color)",
//               "&:hover": {
//                 backgroundColor: "rgba(255, 255, 255, 0.2)",
//                 color: "var(--text-color)",
//               },
//             }}
//           >
//             {theme === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
//           </IconButton>

//           {/* Mantis Dashboard Heading with Icon */}
//           <Box sx={{ display: "flex", alignItems: "center" }}>
//             {sidebarOpen && (
//               <DashboardIcon
//                 sx={{ marginRight: 1, color: "var(--text-color)" }}
//               />
//             )}
//             {sidebarOpen && (
//               <Typography
//                 variant="h6"
//                 noWrap
//                 sx={{ color: "var(--text-color)" }}
//               >
//                 Mantis Dashboard
//               </Typography>
//             )}
//           </Box>

//           {/* Menu Toggle Button (on the right side) */}
//           <IconButton
//             onClick={toggleSidebar}
//             sx={{
//               color: "var(--text-color)",
//               display: sidebarOpen ? "none" : "block", // Hide when sidebar is open
//             }}
//           >
//             <MenuOpenIcon />
//           </IconButton>
//         </Toolbar>
//       </AppBar>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           padding: 3,
//           marginTop: "64px", // Account for fixed AppBar height
//           backgroundColor: "var(--background-color)",
//           color: "var(--text-color)",
//         }}
//       >
//         {/* Main content here */}
//       </Box>
//     </Box>
//   );
// };

// export default DashboardLayout;
