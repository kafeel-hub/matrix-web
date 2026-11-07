import React from "react";
import { IconButton } from "@mui/material";

function CustomIconButton({ Icon, iconSize, onClick }) {
  return (
    <IconButton
      sx={{
        "&:hover": {
          backgroundColor: "transparent",
          color: "#868d8a",
        },
      }}
      onClick={onClick} 
    >
      <Icon fontSize={iconSize} />
    </IconButton>
  );
}

export default CustomIconButton;
