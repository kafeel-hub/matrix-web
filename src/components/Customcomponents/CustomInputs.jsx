import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Popper,
  Paper,
  ClickAwayListener,
  List,
  ListItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// import { DatePicker } from '@mui/x-date-pickers';

const CustomInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onKeyDown,
  onBlur,
  error,
  helperText,
  rows,
  multiline = false,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <TextField
      rows={rows}
      multiline={multiline}
      fullWidth
      label={label}
      name={name}
      type={type}
      variant="outlined"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      error={!!error}
      helperText={helperText}
      color={theme.palette.label.default}
      className="custom-select-input input-box-styling"
      // InputLabelProps={{
      //   shrink: true, // Keeps the label fixed at the top
      // }}
      disabled={disabled}
      focused
      sx={{
        borderRadius: "8px",
        marginBottom: "8px",
        ".MuiOutlinedInput-input": {
          padding: "8px 12px",
          fontSize: "14px",
          textOverflow: "ellipsis",
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
        // "& .MuiOutlinedInput-root.Mui-focused": {
        //   backgroundColor: theme.palette.background.default,
        // },
      }}
    />
  );
};

const StyledSelect = styled(FormControl)(({ theme }) => ({
  borderRadius: "8px",
  marginBottom: "8px",
  ".MuiOutlinedInput-input": {
    padding: "8px 12px",
    fontSize: "14px",
    textOverflow: "ellipsis",
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
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #ccc !important",
    boxShadow: "none !important",
  },
  "& .MuiFormLabel-root.Mui-focused": {
    color: theme.palette.label.default,
  },
}));

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
}) => {
  const theme = useTheme();

  return (
    <StyledSelect
      className="input-box-styling"
      focused
      fullWidth
      variant="outlined"
      error={!!error}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label={label}
        style={{ borderRadius: "8px", width: "100%" }}
        elevation={1}
      >
        {options &&
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </StyledSelect>
  );
};

export default CustomSelect;

// import { StyledTextField } from '@mui/material';

// const CustomDatePicker = ({
//   label,
//   value,
//   onChange,
//   error,
//   helperText,
//   InputProps,
//   ...props
// }) => {
//   return (
//     <DatePicker
//       {...props}
//       value={value}
//       onChange={onChange}
//       renderInput={(params) => (
//         <StyledTextField
//           {...params}
//           sx={{ my: 2 }}
//           label={label}
//           error={error}
//           helperText={error ? helperText : ''}
//           variant="outlined"
//           fullWidth
//           InputProps={{
//             ...params.InputProps,
//             ...InputProps,
//             style: {
//               borderRadius: '12px',
//               ...InputProps?.style,
//             },
//           }}
//           className="custom-input-field"
//         />
//       )}
//     />
//   );
// };

const CustomSearchableDropdown = ({
  options,
  value,
  onChange,
  label,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Filter options based on search input
  const filteredOptions = options.filter(
    (option) =>
      option?.label !== undefined &&
      option?.label !== null &&
      option.label.toString().includes(searchTerm?.toString() || "")
  );

  console.log(filteredOptions, searchTerm, "filterdoptions");
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (option) => {
    console.log(option, "options");
    if (!option) return;
    setSearchTerm(option.label); // Update input value first
    onChange(option.value);
    handleClose(); // Delay closing to prevent flickering
  };

  const theme = useTheme();
  return (
    <div>
      {/* Search field inside the main input field */}
      <TextField
        variant="outlined"
        // placeholder={label}
        label={label}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={handleOpen}
        color={theme.palette.label.default}
        className="custom-select-input input-box-styling"
        // InputLabelProps={{
        //   shrink: true, // Keeps the label fixed at the top
        // }}
        disabled={disabled}
        focused
        fullWidth
        sx={{
          borderRadius: "8px",
          marginBottom: "8px",
          ".MuiOutlinedInput-input": {
            padding: "8px 12px",
            fontSize: "14px",
            textOverflow: "ellipsis",
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
          // "& .MuiOutlinedInput-root.Mui-focused": {
          //   backgroundColor: theme.palette.background.default,
          // },
        }}
      />

      {/* Dropdown List */}
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (!anchorEl?.contains(event.target)) handleClose();
          }}
        >
          <Paper
            style={{
              width: anchorEl?.offsetWidth || 200,
              minHeight: 300,
              overflowY: "auto",
              backgroundColor: "#fff", // Remove transparency
              borderRadius: "8px",
            }}
          >
            <List>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <ListItem
                    button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </ListItem>
                ))
              ) : (
                <ListItem disabled>No options found</ListItem>
              )}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};
const TableInput = ({ label, name, type = "text", value, onChange, error }) => {
  const handleChange = (event) => {
    const inputValue = event.target.value;

    if (type === "number") {
      const numericValue =
        inputValue === "" || !isNaN(inputValue) ? inputValue : value;
      x;
      onChange({ target: { name, value: numericValue } });
    } else {
      onChange(event);
    }
  };

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      variant="outlined"
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      // sx={{
      //   backgroundColor: "#f9fafb",
      //   borderRadius: "8px",
      //   marginBottom: "16px",
      //   "& .MuiOutlinedInput-root": {
      //     borderRadius: "8px",
      //   },
      //   "& .MuiOutlinedInput-notchedOutline": {
      //     border: "1px solid #ccc",
      //   },
      //   "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      //     border: "1px solid #ccc !important",
      //   },
      //   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
      //     {
      //       border: "1px solid #ccc !important",
      //       boxShadow: "none !important",
      //     },
      //   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
      //     {
      //       border: "1px solid #ccc !important",
      //       boxShadow: "none !important",
      //     },
      //   "& .MuiOutlinedInput-root.Mui-focused": {
      //     backgroundColor: "#f9fafb !important",
      //   },
      // }}
    />
  );
};

export { CustomInput, CustomSelect, TableInput, CustomSearchableDropdown };
