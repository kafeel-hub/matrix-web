"use client";
import React, { ChangeEvent } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SearchIcon from "@mui/icons-material/Search";

const CommonSearch = ({
  id,
  label,
  placeholder,
  type,
  name,
  className = "",
  required = false,
  disabled = false,
  onChange = (e) => {},
  error,
  helperText,
  bottomspacing,
  variant = "standard",
  size = "small",
  value,
  multiline,
  maxRows,
  minRows,
  autofocus,
  smallFont,
  onClear,
}) => {
  return (
    <TextField
      id={id}
      helperText={helperText}
      error={error}
      autoFocus={autofocus}
      label={label}
      name={name}
      variant={variant}
      className={`commoninput-cls ${className}`}
      placeholder={placeholder}
      type={type}
      sx={{
        mb: bottomspacing ? 3 : 0,
        ...(smallFont && {
          ".MuiFormLabel-root": {
            top: "-2px",
            fontSize: 14,
          },
          ".MuiOutlinedInput-input": {
            padding: " 6px 14px",
          },
        }),
        "& .MuiOutlinedInput-root": {
          borderRadius: (theme) => theme.palette.cardBorderRadius_md,
          height: "48px",
        },
      }}
      required={required}
      disabled={disabled}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                fontSize: 18,
              }}
            />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {value && (
              <IconButton aria-label="clear-Btn" edge="end" onClick={onClear}>
                <ClearOutlinedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
      size={size}
      value={value}
      multiline={multiline}
      maxRows={maxRows}
      minRows={minRows}
      autoComplete={"off"}
      fullWidth
    />
  );
};

export default CommonSearch;
