import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const CustomDropdown = ({
  id,
  label,
  placeholder = "Select an item",
  value,
  onChange,
  options = [],
  size = "small",
  menuHeight = 300,
  variant = "outlined",
  sx,
  helperText,
  error,
  limitTags = 1,
  type,

  // If you want to perform server-side filtering, set `serverSideSearch` to true
  // and implement `callFilterAction` to update `options` from parent.
  serverSideSearch = false,
  callFilterAction = async (value) => {},

  renderInput = (params) => (
    <TextField
      focused
      {...params}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      className="custom-select-input"
      error={error}
      sx={{
        "& label.Mui-focused": {
          color: "black",
          fontWeight: "bold",
        },
      }}
    />
  ),

  getOptionLabel = (option) => {
    {
      if (!option) return "";
      if (typeof option === "string") return option; // sometimes MUI passes a string
      if (typeof option === "object") {
        // show both number and name if available
        if (option.label && option.value)
          return `${option.value} - ${option.label}`;
        return option.label || option.value || "";
      }
      return String(option);
    }
  },

  isOptionEqualToValue = type === "nameRender"
    ? (option, value) => option.label === value.label
    : (option, value) => option.value === value.value,

  renderOption = (props, option) => (
    <li {...props} key={option.id || option.value}>
      <div>{option.value}</div>
      <div className="" style={{ marginLeft: "10px" }}>
        {option.label}
      </div>
    </li>
  ),

  multiselect = false,
  searchable = true, // new: allow turning off search if needed
  ...props
}) => {
  const [searchText, setSearchText] = useState("");

  // Debounced server-side search
  useEffect(() => {
    if (!serverSideSearch) return;
    const debounce = setTimeout(() => {
      if (callFilterAction) callFilterAction(searchText);
    }, 1000);
    return () => {
      clearTimeout(debounce);
    };
  }, [searchText, serverSideSearch, callFilterAction]);

  // client-side filter builder (matches label + value)
  const clientFilter = createFilterOptions({
    stringify: (option) => `${option.label || ""} ${option.value || ""}`,
  });

  const conditionalRenderOption =
    type === "nameRender"
      ? (props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )
      : (props, option) => (
          <li {...props} key={option.id || option.value}>
            <div>{option.value}</div>
            <div style={{ marginLeft: "10px" }}>{option.label}</div>
          </li>
        );

  return (
    <Autocomplete
      id={id}
      size={size}
      label={label}
      value={value}
      options={options}
      variant={variant}
      multiple={multiselect}
      limitTags={limitTags === 0 ? undefined : limitTags}
      getOptionLabel={getOptionLabel}
      onInputChange={(event, val, reason) => {
        // watch typing and clearing; avoid reacting to "reset" or other reasons
        if (reason === "input" || reason === "clear") setSearchText(val ?? "");
      }}
      // if searchable is false, don't filter (show all). If serverSideSearch is true,
      // expect parent to change 'options' and don't filter client-side.
      filterOptions={
        searchable
          ? serverSideSearch
            ? (opts) => opts
            : clientFilter
          : (opts) => opts
      }
      slotProps={{
        paper: {
          sx: {
            my: "6px",
            "::-webkit-scrollbar": {
              display: "none",
            },
            maxHeight: menuHeight,
            scrollbarWidth: "none",
          },
        },
      }}
      sx={{
        borderRadius: "8px",
        marginBottom: "8px",
        ".MuiOutlinedInput-input": {
          padding: "8px 12px",
          fontSize: "14px",
          textOverflow: "ellipsis",
          minHeight: "25px !important",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #ccc",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #ccc !important",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            border: "1px solid #ccc !important",
            boxShadow: "none !important",
          },
      }}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={renderInput}
      renderOption={conditionalRenderOption}
      onChange={onChange}
      disablePortal
      {...props}
    />
  );
};

export default CustomDropdown;
