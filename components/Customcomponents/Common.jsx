// import React from "react";
import { Typography, Box } from "@mui/material";

const KeyValueDisplay = ({
  title,
  value,
  keyColor = "text.primary",
  valueColor = "warning.main",
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        padding: "8px",
        width: "100%", // Ensure the container uses available width
        overflow: "hidden", // Hide any overflowed content
        textOverflow: "ellipsis", // Show ellipsis if content overflows
        whiteSpace: "nowrap", // Prevent the value from breaking into multiple lines
      }}
    >
      <Typography
        component="span"
        sx={{
          color: keyColor,
          fontWeight: "bold",
          mr: 1,
          fontSize: "0.8rem",
        }}
      >
        {title}:
      </Typography>
      <Typography
        component="span"
        sx={{
          color: valueColor,
          fontWeight: "bold",
          fontSize: "0.8rem",
          maxWidth: "100%", // Ensure value takes available space
          wordBreak: "break-word", // Break the value if it's too long
          whiteSpace: "normal", // Allow wrapping inside value text
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export { KeyValueDisplay };
