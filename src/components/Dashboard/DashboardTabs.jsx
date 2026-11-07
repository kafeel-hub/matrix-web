import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

import {
  EmojiEvents,
  Payments,
  AccountBalance,
  BarChart,
} from "@mui/icons-material";

const DashboardTabs = ({ value, onChange }) => {
  const tabs = [
    {
      label: "Overview",
      icon: <BarChart sx={{ fontSize: 14 }} />,
    },
    {
      label: "Gold & Scrap",
      icon: <EmojiEvents sx={{ fontSize: 14 }} />,
    },
    {
      label: "Cash Flow",
      icon: <Payments sx={{ fontSize: 14 }} />,
    },
    {
      label: "Balances",
      icon: <AccountBalance sx={{ fontSize: 14 }} />,
    },
  ];

  return (
    <Box
      sx={{
        borderBottom: "1px solid #23263b",
        background: "#090a18",

        px: {
          xs: 1,
          sm: 2.5,
        },

        height: {
          xs: 46,
          sm: 52,
        },

        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <Tabs
        value={value}
        onChange={(e, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        TabIndicatorProps={{
          style: {
            display: "none",
          },
        }}
        sx={{
          minHeight: "unset",
          width: "100%",

          "& .MuiTabs-flexContainer": {
            gap: {
              xs: "2px",
              sm: "4px",
            },
          },

          "& .MuiTabs-scrollButtons": {
            color: "#9ea3d1",
          },

          "& .MuiTabs-scrollButtons.Mui-disabled": {
            opacity: 0.2,
          },

          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {tabs.map((t, i) => (
          <Tab
            key={i}
            icon={t.icon}
            iconPosition="start"
            label={t.label}
            disableRipple
            sx={{
              minHeight: {
                xs: 36,
                sm: 40,
              },

              textTransform: "none",

              fontSize: {
                xs: 10,
                sm: 11,
              },

              fontWeight: 700,
              color: "#8e93bc",

              px: {
                xs: 1.2,
                sm: 2,
              },

              // minWidth: "max-content",
              minWidth: {
                xs: "auto",
                sm: "max-content",
              },
              borderRadius: "6px 6px 0 0",

              "& .MuiTab-iconWrapper": {
                marginRight: "5px",
              },

              "&.Mui-selected": {
                color: "#f0c33c",

                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",

                border: "1px solid #2b2e52",

                borderBottom: "1px solid #090a18",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default DashboardTabs;
