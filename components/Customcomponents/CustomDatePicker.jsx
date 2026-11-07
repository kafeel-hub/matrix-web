import React from "react";
import dayjs from "dayjs";
import {
  // LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function CustomDatePicker({
  value,
  defaultValue,
  onChange,
  errors,
  label = "Date",
}) {
  const getValidDate = (date) => {
    return dayjs(date).isValid()
      ? dayjs(date)
      : dayjs(defaultValue || new Date());
  };
  // const getValidDate = (date) => {
  //   console.log(date, "date componenet");
  //   if (!date) return null; // allow blank date

  //   return dayjs.isDayjs(date) && date.isValid()
  //     ? date
  //     : dayjs(defaultValue || new Date());
  // };
  console.log(getValidDate(), "validate value");
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        className="input-box-styling custom-select-input"
        focused
        sx={{
          width: "100%",
          borderRadius: "8px",
          marginBottom: "8px",
          ".MuiOutlinedInput-input": {
            padding: "10px 12px",
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
        // value={value}
        value={getValidDate(value)}
        defaultValue={defaultValue ? defaultValue : dayjs(new Date())}
        onChange={onChange}
        slotProps={(params) => (
          <TextField
            {...params}
            fullWidth
            error={!!errors.date}
            helperText={errors.date}
            focused
          />
        )}
      />
    </LocalizationProvider>
  );
}

export default CustomDatePicker;
