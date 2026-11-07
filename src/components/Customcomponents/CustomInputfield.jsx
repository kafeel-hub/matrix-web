import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const InputFieldUpdated = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  size = "small",
  disabled = false,
  required = false,
  error = false,
  helperText = "",
  fullWidth = true,
  multiline = false,
  rows = 1,
  variant = "outlined",
  placeholder = "",
  inputProps = {},
  sx = {},
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <TextField
      id={id}
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      value={value}
      size={size}
      sx={{
        width: "100%",
        ".MuiInputLabel-root": {
          fontSize: "14px",
        },
        ".MuiOutlinedInput-root": {
          borderRadius: (theme) => theme.palette.borderRadius_sm,
          ".MuiOutlinedInput-input": {
            padding: "10px 12px",
            fontSize: "14px",
            textOverflow: "ellipsis",
          },
          ".MuiInputBase-inputMultiline": {
            padding: "0px",
          },
          ".MuiIconButton-root": {
            padding: "7px 8px",
          },
          ".MuiInputAdornment-root": {
            marginLeft: "0px",
          },
        },
      }}
      type={type === "password" && !showPassword ? "password" : type}
      className="custom-input-field"
      onChange={onChange}
      helperText={helperText}
      error={error}
      disabled={disabled}
      slotProps={{
        input: {
          readOnly: disabled,
          min: 0, 
         },
         htmlInput: { min: 0},
      }}
      multiline={multiline}
      placeholder={placeholder}
      required={required}
      inputProps={inputProps}
      rows={rows}

      InputProps={
        
        type === "password"
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <VisibilityOutlinedIcon />
                    ) : (
                      <VisibilityOffOutlinedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }
          : undefined
      }
      {...rest}
    />
  );
};

export default InputFieldUpdated;
