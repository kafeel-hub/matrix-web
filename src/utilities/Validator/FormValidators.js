function validateForm(requiredFields, setErrors, formData) {
  const newErrors = {};

  // requiredFields.forEach(({ key, message }) => {
  //   if (!formData[key]) {
  //     newErrors[key] = message;
  //   }
  // });
  requiredFields.forEach(({ key, message, validate }) => {
    const value = formData[key];
    if (validate) {
      if (value === undefined || isNaN(value) || !validate(value))
        newErrors[key] = message;
    } else if (!value) {
      newErrors[key] = message;
    }
  });

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return Object.keys(newErrors).length === 0;
}

function validateItemForm(requiredFields, setErrors, formData) {
  const newErrors = {};

  requiredFields.forEach(({ key, message, validate, required }) => {
    const value = formData[key];

    if (required) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (validate && !validate(value))
      ) {
        newErrors[key] = message;
      }
    } else if (
      validate &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      if (!validate(value)) {
        newErrors[key] = message;
      }
    }
  });

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return Object.keys(newErrors).length === 0;
}

// function validateTableRowsData(requiredFields,row) {
//       const errors = {};
//       // const requiredFields = [
//       //   { key: "itemCode", message: "Product is required." },
//       //   { key: "description", message: "Description is required." },
//       //   { key: "purity", message: "Purity must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "qty", message: "Quantity must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "grossWt", message: "Gross weight must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "stoneWt", message: "Stone weight must be a valid number (0 or greater).", validate: (val) => val >= 0 },
//       //   { key: "netWt", message: "Net weight must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "goldPrice", message: "Gold price must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "mcPerGm", message: "Making charge per gram must be a valid number (0 or greater).", validate: (val) => val >= 0 },
//       //   { key: "unitPricePerGm", message: "Unit price per gram must be a valid number greater than 0.", validate: (val) => val > 0 },
//       //   { key: "stoneAmount", message: "Stone amount must be a valid number (0 or greater).", validate: (val) => val >= 0 },
//       //   { key: "amount", message: "Amount must be a valid number greater than 0.", validate: (val) => val > 0 },
//       // ];

//       requiredFields.forEach(({ key, message, validate }) => {
//         const value = row[key];
//         if (validate) {
//           if (value === undefined || isNaN(value) || !validate(value)) errors[key] = message;
//         } else if (!value) {
//           errors[key] = message;
//         }
//       });

//       return errors;

// }
function validateTableRowsData(fields, rowData) {
  const errors = {};

  fields.forEach((field) => {
    // Skip validation for itemType (radio)
    if (field.key === "itemType") return;

    const value = rowData[field.key];

    // Check required fields
    if (
      field.required &&
      (value === "" || value === undefined || value === null)
    ) {
      errors[field.key] =
        field.message || `${field.label || field.key} is required`;
      return;
    }

    // Check custom validation if defined
    if (field.validate && !field.validate(value)) {
      errors[field.key] =
        field.message || `${field.label || field.key} is invalid`;
    }
  });

  return errors;
}

export { validateForm, validateTableRowsData, validateItemForm };
