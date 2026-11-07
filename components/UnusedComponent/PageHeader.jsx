import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2"; // Make sure to import Grid from '@mui/material/Grid'
import { CustomInput } from "./Customcomponents/CustomInputs";
import InputFieldUpdated from "./Customcomponents/CustomInputfield";
// import { CustomSelect } from "./Customcomponents/CustomInputs";
import CustomDropdown from "./Customcomponents/CustomDropdown";
const PageHeader = () => {
  const [formData, setFormData] = useState({
    item1: "",
    item2: "",
    item3: "",
  });

  const [dropdownValue, setDropdownValue] = useState(null);
  const options = [
    { label: "Option 1", id: "1" },
    { label: "Option 2", id: "2" },
    { label: "Option 3", id: "3" },
  ];

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle dropdown change
  const handleDropdownChange = (e, newValue) => {
    setDropdownValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <CustomDropdown
            label="Company Name"
            value={dropdownValue}
            onChange={handleDropdownChange}
            options={options}
            error={false}
            helperText={"Choose an option from the dropdown"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomDropdown
            label="Sales Person"
            value={dropdownValue}
            onChange={handleDropdownChange}
            options={options}
            error={false}
            helperText={"Choose an option from the dropdown"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomDropdown
            label="Location"
            value={dropdownValue}
            onChange={handleDropdownChange}
            options={options}
            error={false}
            helperText={"Choose an option from the dropdown"}
          />
        </Grid>
        {/* Input Fields Row */}
        <Grid item xs={12} sm={4}>
          <InputFieldUpdated
            label="Invoice No."
            name="item1" // Ensure name matches the state field
            value={formData.item1}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InputFieldUpdated
            label="User Name"
            name="item2" // Ensure name matches the state field
            value={formData.item2}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InputFieldUpdated
            label="Date"
            name="item3" // Ensure name matches the state field
            value={formData.item3}
            onChange={handleInputChange}
          />
        </Grid>

        {/* Dropdown Row */}
      </Grid>
    </Box>
  );
};

export default PageHeader;
