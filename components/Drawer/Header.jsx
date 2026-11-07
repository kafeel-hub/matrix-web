import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

const GoldWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";

    script.async = true;

    script.innerHTML = JSON.stringify({
      symbol: "TVC:GOLD",

      width: "100%",

      height: 126,

      colorTheme: "light",

      isTransparent: true,

      locale: "en",
    });

    const container = document.getElementById("gold-widget-container");

    if (container) {
      container.innerHTML = "";

      container.appendChild(script);
    }
  }, []);

  return (
    <Box
      sx={{
        width: "100%",

        height: 72,

        overflow: "hidden",

        display: "flex",

        alignItems: "flex-start",

        justifyContent: "center",
      }}
    >
      <Box
        id="gold-widget-container"
        sx={{
          width: "100%",

          transform: "scale(0.72)",

          transformOrigin: "top center",

          "& iframe": {
            width: "100% !important",
          },
        }}
      />
    </Box>
  );
};

const Header = ({ drawerWidth, toggleDrawer }) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const companyDetails = useSelector(
    (state) => state.auth?.CompanyDetails || [],
  );

  const userName = useSelector((state) => state.auth?.userName || "");

  const [dashboardData, setDashboardData] = useState({});

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (companyDetails.length > 0) {
      setDashboardData(companyDetails[0]);
    }
  }, [companyDetails]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const renderDesktopContent = () => {
    return (
      <Box
        sx={{
          width: "100%",

          px: 1,

          py: 0.5,

          background: "#e9e9e9",

          borderBottom: "1px solid #cfcfcf",
        }}
      >
        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            gap: 2,

            width: "100%",
          }}
        >
          {/* DETAILS BOX */}
          <Box
            sx={{
              flex: 1.5,

              border: "1px solid #bdbdbd",

              borderRadius: "14px",

              background: "#e9e9e9",
              justifyContent: "space-between",
              px: 2,

              py: 1.2,

              display: "flex",

              alignItems: "center",

              gap: 2,

              overflow: "hidden",

              whiteSpace: "nowrap",

              minHeight: 68,
            }}
          >
            {/* COMPANY */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#111827",
                }}
              >
                Company Name:
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                {dashboardData?.CompanyName}
              </Typography>
            </Box>

            {/* BRANCH */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#111827",
                }}
              >
                Branch:
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                {dashboardData?.LocName}
              </Typography>
            </Box>

            {/* YEAR */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#111827",
                }}
              >
                Financial Year:
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                {dashboardData?.FinancialYear}
              </Typography>
            </Box>

            {/* USERNAME */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#111827",
                }}
              >
                Username:
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                {userName}
              </Typography>
            </Box>
          </Box>

          {/* WIDGET */}
          <Box
            sx={{
              width: 220,

              minWidth: 220,

              height: 70,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              overflow: "hidden",

              background: "#e9e9e9",
            }}
          >
            <GoldWidget />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderMobileContent = () => {
    return (
      <Box
        sx={{
          width: "100%",

          p: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",

            flexDirection: "column",

            gap: 1,
          }}
        >
          <Box
            sx={{
              border: "1px solid #d0d0d0",

              borderRadius: "10px",

              background: theme.palette.background.paper,

              p: 1.2,
            }}
          >
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Company Name: {dashboardData?.CompanyName}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Branch: {dashboardData?.LocName}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Financial Year: {dashboardData?.FinancialYear}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Username: {userName}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              border: "1px solid #d0d0d0",

              borderRadius: "10px",

              background: theme.palette.background.paper,

              px: 1,
            }}
          >
            <GoldWidget />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,

        background: "#e9e9e9",

        transition: "margin 0.3s, width 0.3s",

        overflowX: "hidden",

        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      {!isMobile ? (
        renderDesktopContent()
      ) : (
        <Accordion
          expanded={expanded}
          sx={{
            background: theme.palette.background.default,

            boxShadow: "none",

            "&::before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon onClick={handleToggle} />}
            sx={{
              minHeight: "48px !important",

              px: 1,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              {!expanded && (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer}
                  size="small"
                >
                  <MenuIcon
                    sx={{
                      color: theme.palette.text.primary,
                    }}
                  />
                </IconButton>
              )}

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                Dashboard Details
              </Typography>
            </Box>
          </AccordionSummary>

          <Toolbar
            sx={{
              px: 0,
              pb: 1,
            }}
          >
            {renderMobileContent()}
          </Toolbar>
        </Accordion>
      )}
    </AppBar>
  );
};

export default Header;
