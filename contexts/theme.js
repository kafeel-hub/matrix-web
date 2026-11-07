// src/theme.js
import { createTheme } from "@mui/material/styles";

const getTheme = (mode, primaryColor, secondaryColor, fontFamily) =>
  createTheme({
    palette: {
      mode: mode || "light",
      primary: {
        main: primaryColor || "#00a76f",
      },
      secondary: {
        main: secondaryColor || "#9c27b0",
      },
      backgroundhead: {
        default: mode === "dark" ? "#121212" : "#00a76f",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#f4f6f8",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
        selected: mode === "dark" ? "inherited" : "rgb(239 248 244)",
        lightGreen: mode==="dark" ? "#121212" : "#d4e9e2",
        newColor: "dark" ? "#919EAB" : "gray",
      },

      table: {
        default: mode === "dark" ? "#121212" : "#00a76f",
        text: "#ffffff",
      },

      text: {
        primary: mode === "dark" ? "#ffffff" : "#1C252E",
        secondary: mode === "dark" ? "#919EAB" : "#000000",
        tertiary: mode === "dark"?"#D9D9D9D9": "#00000089",
        quaternary: "#ffffff",
        muted: "#919EAB",
        selected: "#00a76f",
        hover: mode === "dark" ? "#4b4a4a" : "#ececec",
      },

      label: {
        default: mode === "dark" ? "#919EAB" : "#000000",
      },
    },
    components: {
      MuiTableHead: {
        styleOverrides: {
          root: { backgroundColor: "#00a76f" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { color: "#ffffff", fontWeight: 700 },
        },
      },
    },
    typography: {
      fontFamily: fontFamily || '"SoDoSans-Regular", sans-serif',
    },
  });

export default getTheme;