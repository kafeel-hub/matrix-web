import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

export const StyledPrimaryButton = styled(Button)(({ theme }) => ({
  padding: "4px 18px",
  fontFamily: "Montserrat",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  border: `1px solid ${theme.palette.primary.light}`,
  textTransform: "unset",
  borderRadius: theme.palette.borderRadius_sm,
  lineHeight: "20px",
  ":hover": {
    opacity: 0.8,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

export const StyledSecondaryButton = styled(Button)(({ theme }) => ({
  padding: "4px 18px",
  fontFamily: "Montserrat",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.light}`,
  textTransform: "unset",
  borderRadius: theme.palette.borderRadius_sm,
  lineHeight: "20px",
}));

export const StyledPositiveButton = styled(Button)(({ theme }) => ({
  padding: "4px 18px",
  fontFamily: "Montserrat",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  textTransform: "unset",
  borderRadius: theme.palette.borderRadius_sm,
  lineHeight: "20px",
}));

export const StyledNegetiveButton = styled(Button)(({ theme }) => ({
  padding: "4px 18px",
  //   fontFamily: "Montserrat",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grey.dark,
  border: `1px solid ${theme.palette.grey.dark}`,
  textTransform: "unset",
  borderRadius: theme.palette.borderRadius_sm,
  lineHeight: "20px",
}));

export const StyledMoreButton = styled(Button)(({ theme }) => ({
  padding: "4px 18px",
  fontFamily: "Montserrat",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grey.dark,
  border: `1px solid ${theme.palette.common.white}`,
  textTransform: "unset",
  borderRadius: theme.palette.borderRadius_sm,
  lineHeight: "20px",
}));
