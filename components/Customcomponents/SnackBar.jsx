import React from 'react'
import {
    Snackbar,
  } from "@mui/material";
function SnackBar(props) {

  const {showSnackbar, setShowSnackbar, message,type} = props
  return (
    <Snackbar
    open={showSnackbar}
    autoHideDuration={3000}
    onClose={() => setShowSnackbar(false)}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <Alert
      onClose={() => setShowSnackbar(false)}
      severity={type}
      sx={{ width: "100%" }}
    >
      {message}
      {/* Item deleted successfully! */}
    </Alert>
  </Snackbar>
  )
}

export default SnackBar