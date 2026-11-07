import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Styled Components
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  ".MuiDialog-paper": {
    position: "static",
    borderRadius: theme.palette.borderRadius_sm,
    minWidth: "30%",
    width: "100%",
    textAlign: "start",
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.textTitle,
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({}));

export const StyledDialogContentText = styled(DialogContentText)(
  ({ theme }) => ({
    color: theme.palette.grey.dark,
  })
);

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: "16px",
}));
