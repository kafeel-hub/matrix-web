// import { useMemo } from "react";

// // import {
// //   StyledPrimaryButton,
// //   StyledSecondaryButton,
// //   StyledPositiveButton,
// //   StyledNegetiveButton,
// //   StyledMoreButton,
// // } from "@components/ui/Button";
// import {
//   StyledPrimaryButton,
//   StyledSecondaryButton,
//   StyledPositiveButton,
//   StyledNegetiveButton,
//   StyledMoreButton,
// } from "../Ui/Button";
// const CustomButton = ({
//   variant = "primary",
//   size = "md",
//   label,
//   sx,
//   ...props
// }) => {
//   const buttonVariants = {
//     primary: StyledPrimaryButton,
//     positive: StyledPositiveButton,
//     negative: StyledNegetiveButton,
//     more: StyledMoreButton,
//     secondary: StyledSecondaryButton,
//   };

//   const Button = useMemo(
//     () => buttonVariants[variant] || StyledPrimaryButton,
//     [variant]
//   );

//   return (
//     <Button
//       {...props}
//       sx={{
//         padding: size == "xs" ? "4px 18px" : "8px 22px",
//         ...sx,
//       }}
//     >
//       {label}
//     </Button>
//   );
// };

// export default CustomButton;

import React from "react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

const CustomButton = ({
  text,
  theme,
  className,
  variantType,
  icon = false,
  type,
  loading = false,
  disabled = false,
  BtnIcon=null,
  ...props
}) => {
  const buttonClass1 = `custom-btn ${
    theme && theme.palette.mode === "dark"
      ? "custom-btn-white"
      : "custom-btn-black"
  } shadow-box ${className}`;
  const buttonClass2 = `custom-btn ${
    theme && theme.palette.mode === "dark"
      ? "custom-btn-black"
      : "custom-btn-white"
  } shadow-box ${className}`;

  return (
    <>
      {/* <Button disabled={disabled} type={type} className={`${variantType ==="dark"? buttonClass1:buttonClass2}`} {...props}>
      {loading? <>...Loading</>:text}
    </Button> */}
      <LoadingButton
        // color="secondary"
        className={`${variantType ==="dark"? buttonClass1:buttonClass2}`}
        type={type}
        loading={loading}
        loadingPosition="start"
        startIcon={BtnIcon ? <BtnIcon sx={{ marginRight: "8px" }} /> : null}
        // variant="contained"
        {...props}
      >
        {text}
      </LoadingButton>
    </>
  );
};

export default CustomButton;
