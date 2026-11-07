import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "./CustomButton";

/**
 * 
 * @param {Object} props 
 * @param {boolean} props.open 
 * @param {Function} props.onClose 
 * @param {string} props.title 
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onSubmit] 
 * @param {string} [props.submitButtonText="Submit"] 
 * @param {boolean} [props.showSubmitButton=true]
 */
const CustomModal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitButtonText = "Submit",
  showSubmitButton = true,
  closeButtonText = "Cancel"
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm" 
      // (options: 'xs', 'sm', 'md', 'lg', 'xl')
    >
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {children}
      </DialogContent>
      <Divider />
      {showSubmitButton && (
        <DialogActions sx={{p:2}}>
          <CustomButton
         onClick={onClose}
         text={closeButtonText}
         // theme={theme}
        //  sx={{ mt: 2 }}
         variantType="dark"
         type="submit"
        //  disabled={itemloading}
        //  loading={itemloading}
        // startIcon={<AddIcon />}
        />
        
        <CustomButton
         onClick={onSubmit}
         text={submitButtonText}
         // theme={theme}
        //  sx={{ mt: 2 }}
         variantType="light"
         type="submit"
        //  disabled={itemloading}
        //  loading={itemloading}
        // startIcon={<AddIcon />}
        />
        </DialogActions>
      )}
    </Dialog>
  );
};
export default CustomModal;
