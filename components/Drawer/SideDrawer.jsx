import React, { useContext, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Button,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Home,
  Dashboard,
  Business,
  ExpandLess,
  ExpandMore,
  Menu,
  MenuOpen,
  Brightness4,
  Brightness7,
  Logout,
  LocationOn,
  Info,
  Store,
} from "@mui/icons-material";
import Globalpopup from "../Customcomponents/Globalpopup";
import { ThemeContext } from "../../contexts/ThemeProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import Loader from "../Loader/Loader";
import { useTheme } from "@mui/material/styles";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import InventoryIcon from "@mui/icons-material/Inventory";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import StoreIcon from "@mui/icons-material/Store";
import DatasetIcon from "@mui/icons-material/Dataset";
import TableViewIcon from "@mui/icons-material/TableView";
import GridGoldenratioIcon from "@mui/icons-material/GridGoldenratio";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CategoryIcon from "@mui/icons-material/Category";
import ClassIcon from "@mui/icons-material/Class";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import SupplierIcon from "../../assets/icons/supplier.svg";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
const drawerWidth = 240;
const collapsedWidth = 60;

const SideDrawer = (props) => {
  const theme = useTheme();

  const {
    isCollapsed,
    setIsCollapsed,
    logOut,
    isMobile,
    openDrawer,
    closeDrawer,
    tenantKey,
    refreshToken,
  } = props;
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState({
    company: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => {
    if (isMobile) {
      closeDrawer();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const menuItems = [
    // { text: "Home", icon: <Home />, path: "/home" },

    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    // { text: "Company Branch", icon: <Store />, path: "/company-branch" },

    // { text: "Gold", icon: <GridGoldenratioIcon />, path: "/gold" },
    // {
    //   text: "Gold Data",
    //   icon: <GridGoldenratioIcon />,
    //   path: "/gold-data-table",
    // },

    {
      text: "Point of Sale",
      icon: <MonetizationOnIcon />,
      children: [
        // { text: "Company Branch", icon: <Store />, path: "/company-branch" },
        {
          text: "Invoice",
          icon: <PointOfSaleIcon />,
          path: "/retail-invoice",
        },
        {
          text: "Return",
          icon: <AssignmentReturnIcon />,
          path: "/sales-return-invoice",
        },
        {
          text: "Scrap Purchase",
          icon: <StoreIcon />,
          path: "/Scrap-purchase-invoice",
        },

        {
          text: "Petty Cash Expense",
          icon: <CardGiftcardIcon />,
          path: "/prettycashexpenses",
        },

        // { text: "Invoice Table", icon: <Home />, path: "/gold-data-table" },
        // {
        //   text: "Company Location",
        //   icon: <LocationOn />,
        //   path: "/company-location",
        // },
        // { text: "Company Details", icon: <Info />, path: "/company-details" },
      ],
    },
    {
      text: "Queries",
      icon: <DatasetIcon />,
      children: [
        // { text: "Company Branch", icon: <Store />, path: "/company-branch" },

        {
          text: "Invoice Details",
          icon: <TableViewIcon />,
          path: "/gold-data-table",
        },
        // {
        //   text: "Company Location",
        //   icon: <LocationOn />,
        //   path: "/company-location",
        // },
        // { text: "Company Details", icon: <Info />, path: "/company-details" },
      ],
    },

    {
      text: "Master",
      icon: <AdminPanelSettingsIcon />,
      children: [
        {
          text: "Customer",
          icon: <TableViewIcon />,
          path: "/master-customer",
        },
        {
          text: "Supplier",
          icon: <PrecisionManufacturingIcon />,
          // icon: <img src={SupplierIcon} alt="Supplier" style={{ width: 24, height: 24 }} />,

          path: "/master-supplier",
        },
        {
          text: "Item Category",
          icon: <CategoryIcon />,
          path: "/master-item-category",
        },
        {
          text: "Item Type",
          icon: <ClassIcon />,
          path: "/master-item-type",
        },
        {
          text: "Item",
          icon: <Inventory2Icon />,
          path: "/master-item",
        },
        { text: "Payment Type", icon: <TableViewIcon />, path: "/master-payment-type" },
        { text: "Currency", icon: <TableViewIcon />, path: "/master-currency" },
        { text: "Country", icon: <TableViewIcon />, path: "/master-country" },
        { text: "Area", icon: <TableViewIcon />, path: "/master-area" },
        { text: "Salesman", icon: <TableViewIcon />, path: "/master-salesman" },
        { text: "Gold Purity", icon: <TableViewIcon />, path: "/master-gold-purity" },
        { text: "Item Subcategory", icon: <CategoryIcon />, path: "/master-item-subcategory" },
        { text: "Item Design", icon: <TableViewIcon />, path: "/master-item-design" },
      ],
    },
    {
      text: "Reports",
      icon: <AdminPanelSettingsIcon />,
      children: [
        {
          text: "Daily Reports",
          icon: <TableViewIcon />,
          path: "/daily-reports",
        },
        {
          text: "Sale Invoice",
          icon: <TableViewIcon />,
          path: "/sales-report",
        },
        // {
        //   text: "Supplier",
        //   icon: <PrecisionManufacturingIcon />,
        //   // icon: <img src={SupplierIcon} alt="Supplier" style={{ width: 24, height: 24 }} />,

        //   path: "/master-supplier",
        // },
        // {
        //   text: "Item Category",
        //   icon: <CategoryIcon />,
        //   path: "/master-item-category",
        // },
        // {
        //   text: "Item Type",
        //   icon: <ClassIcon />,
        //   path: "/master-item-type",
        // },
        // {
        //   text: "Item",
        //   icon: <Inventory2Icon />,
        //   path: "/master-item",
        // },
      ],
    },
    {
      text: "Transactions",
      icon: <ReceiptLongIcon />,
      children: [
        {
          text: "Unfix Purchase",
          icon: <InventoryIcon />,
          path: "/gold-unfixed-purchase",
        },
        {
          text: "Unfix Sale",
          icon: <InventoryIcon />,
          path: "/gold-unfixed-sales",
        },
        {
          text: "Gold Reciept Voucher",
          icon: <CardGiftcardIcon />,
          path: "/gold-receipt-voucher",
        },
        {
          text: " Gold Payment Voucher",
          icon: <CardGiftcardIcon />,
          path: "/goldpayment-voucher",
        },

        {
          text: "Sale Gold Fixing Voucher",
          icon: <CardGiftcardIcon />,
          path: "/salegoldfixing-voucher",
        },

        {
          text: "Purchase Gold Fixing Voucher",
          icon: <CardGiftcardIcon />,
          path: "/purchasegoldfixing-voucher",
        },

        {
          text: "Reciept Voucher",
          icon: <CardGiftcardIcon />,
          path: "/reciept-voucher",
        },
        {
          text: "Payment Voucher",
          icon: <CardGiftcardIcon />,
          path: "/payment-voucher",
        },
      ],
    },
  ];

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      logOut({ navigate, tenantKey, refreshToken });
    }, 2000);
  };

  const handleToggleSubMenu = (menu) => {
    setOpenSubMenu({
      ...openSubMenu,
      [menu]: !openSubMenu[menu],
    });
  };

  const isActive = (path) => location.pathname === path;
  const widthHandler = () => {
    if (isCollapsed && isMobile) {
      return drawerWidth;
    }
    if (isCollapsed && !isMobile) {
    }
    return;
  };

  return (
    <>
      <Globalpopup />
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? openDrawer : true}
        onClose={isMobile ? closeDrawer : undefined}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: isCollapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isCollapsed ? collapsedWidth : drawerWidth,
            boxSizing: "border-box",
            // overflowX: "hidden",
            transition: "width 0.3s",
          },
        }}
      >
        {/* <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? openDrawer : true}
      onClose={isMobile ? closeDrawer : undefined}
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          transition: "width 0.3s",
        },
      }}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
    ></Drawer> */}
        {loading && <Loader />}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            p: 1,
          }}
        >
          {!isCollapsed && <Box sx={{ pl: 2 }}>BESTO JEWEL</Box>}
          <IconButton onClick={toggleDrawer}>
            {isMobile ? <MenuOpen /> : <Menu />}
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) =>
            item.children ? (
              <React.Fragment key={item.text}>
                {/* Parent Item */}
                <ListItem
                  button
                  onClick={() => handleToggleSubMenu(item.text)}
                  sx={{
                    display: "flex",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    backgroundColor: isActive(item.path)
                      ? theme.palette.background.selected
                      : "primary",
                    color: isActive(item.path)
                      ? theme.palette.text.selected
                      : "inherit",
                    "&:hover": {
                      backgroundColor: theme.palette.background.hover,
                      // color: "white",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      justifyContent: "center",
                      color: isActive(item.path)
                        ? theme.palette.text.selected
                        : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <>
                      <ListItemText primary={item.text} />
                      <IconButton
                        sx={{ minWidth: 30 }}
                        size="small"
                        onClick={() => handleToggleSubMenu(item.text)}
                      >
                        {openSubMenu[item.text] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </>
                  )}
                </ListItem>
                {/* Nested Items */}
                <Collapse
                  in={openSubMenu[item.text] || isCollapsed}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem
                        button
                        key={child.text}
                        onClick={() => navigate(child.path)}
                        sx={{
                          pl: isCollapsed ? 0 : 4,
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          backgroundColor: isActive(child.path)
                            ? theme.palette.background.selected
                            : "transparent",
                          color: isActive(child.path)
                            ? theme.palette.text.selected
                            : "inherit",
                          "&:hover": {
                            backgroundColor: theme.palette.text.hover,
                            // color: "white",
                          },
                        }}
                      >
                        <Tooltip
                          title={child.text}
                          placement="right"
                          disableHoverListener={!isCollapsed}
                        >
                          <ListItemIcon
                            sx={{
                              justifyContent: "center",
                              color: isActive(child.path)
                                ? theme.palette.text.selected
                                : "inherit",
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                        </Tooltip>
                        {!isCollapsed && (
                          <ListItemText
                            primary={child.text}
                            sx={{ fontSize: "0.9rem" }}
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  display: "flex",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  backgroundColor: isActive(item.path)
                    ? theme.palette.background.selected
                    : "transparent",
                  color: isActive(item.path)
                    ? theme.palette.text.selected
                    : "inherit",
                  // '&:hover': {
                  //   backgroundColor: "primary.main",
                  //   color: "white",
                  // },
                }}
              >
                <ListItemIcon
                  sx={{
                    justifyContent: "center",
                    color: isActive(item.path)
                      ? theme.palette.text.selected
                      : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItem>
            )
          )}
        </List>
        <Box
          sx={{
            mt: "auto",
            mb: 1,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: isCollapsed ? "center" : "flex-start",
            px: 2,
          }}
        >
          <IconButton onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          {!isCollapsed && (
            <Button
              color="action"
              onClick={handleLogout}
              sx={{
                "&.MuiButtonBase-root:hover": {
                  bgcolor: "transparent",
                  color: "blue",
                },
              }}
              endIcon={<Logout />}
            >
              <div>Logout</div>
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};

const mapStateToProps = ({ auth = {} }) => ({
  tenantKey: auth.tenantKey || "",
  refreshToken: auth.refreshToken || "",
});

const mapDispatchToProps = (dispatch) => ({
  logOut: (data) => {
    dispatch({ type: "logoutCalled", payload: data });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SideDrawer);
