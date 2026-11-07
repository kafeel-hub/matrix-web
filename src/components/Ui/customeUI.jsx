"use client";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import {
  Menu,
  MenuItem,
  Button,
  TableCell,
  Typography,
  IconButton,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

export const PurpleStyledButton = styled(Button)(({ theme }) => ({
  //   width: "150px",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.palette.purpleColor,
  padding: "6px 18px",
  backgroundColor: theme.palette.purpleBtnRgba,
  textTransform: "capitalize",
  borderRadius: "8px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.purpleColor,
    color: theme.palette.whiteColor,
  },
  "&:focus": {
    backgroundColor: theme.palette.purpleColor,
    color: theme.palette.whiteColor,
  },
  "&:active": {
    backgroundColor: theme.palette.purpleColor,
    color: theme.palette.whiteColor,
  },
}));

export const BlueStyledButton = styled(Button)(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 600,
  color: theme.palette.primaryColor,
  padding: "6px 18px",
  backgroundColor: theme.palette.btnBgPrimary,
  textTransform: "capitalize",
  //   border: "1px solid #48A3D7 ",
  borderRadius: theme.palette.borderRadius_xs,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.primaryColor,
    color: theme.palette.whiteColor,
  },
  "&:focus": {
    backgroundColor: theme.palette.primaryColor,
    color: theme.palette.whiteColor,
  },
  "&:active": {
    backgroundColor: theme.palette.primaryColor,
    color: theme.palette.whiteColor,
  },
}));

export const PrimaryStyledButton = styled(Button)(({ theme }) => ({
  //   width: "150px",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.palette.buttonTextColorPrimary,
  padding: "6px 18px",
  backgroundColor: theme.palette.buttonBgColorPrimary,
  textTransform: "capitalize",
  borderRadius: "8px",
  boxShadow: "none",
  "&:focus": {
    backgroundColor: theme.palette.buttonBgColorPrimary,
    color: theme.palette.buttonTextColorPrimary,
  },
  "&:hover": {
    backgroundColor: theme.palette.buttonBgColorPrimary,
    color: theme.palette.buttonTextColorPrimary,
  },
  "&:active": {
    backgroundColor: theme.palette.buttonBgColorPrimary,
    color: theme.palette.buttonTextColorPrimary,
  },
}));

export const RedStyledButton = styled(Button)(({ theme }) => ({
  //   width: "150px",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.palette.whiteColor,
  padding: "6px 18px",
  backgroundColor: theme.palette.danger,
  textTransform: "capitalize",
  borderRadius: "8px",
  boxShadow: "none",
  "&:focus": {
    backgroundColor: theme.palette.danger,
    color: theme.palette.whiteColor,
  },
  "&:hover": {
    backgroundColor: theme.palette.danger,
    color: theme.palette.whiteColor,
  },
  "&:active": {
    backgroundColor: theme.palette.danger,
    color: theme.palette.whiteColor,
  },
}));

export const MenuStyled = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.palette.cardBorderRadius_md,
    boxShadow: theme.palette.cardShadow,
  },
}));

export const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  padding: "6px 12px",
  fontSize: 14,
  color: "#2b2b2b",
  opacity: 0.6,
  minWidth: 140,
}));

export const TotalTableCell = styled(TableCell)(({ theme }) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  // color: theme.palette.innerTextColor,
  fontSize: 13,
  fontWeight: 600,
  borderBottom: "none",
  padding: "8px 16px",
  // border: `1px solid ${theme.palette.primaryColor}`,
  borderRight: "none",
  borderLeft: "none",
  // textTransform: "capitalize",
  // backgroundColor: theme.palette.primaryColor,
  backgroundColor: theme.palette.tableBg,
  color: theme.palette.tableTextColor,
}));

export const FiberManualRecordIconStyled = styled(FiberManualRecordIcon)(
  ({ theme }) => ({
    // paddingLeft: "4px",
    fontSize: 14,
  })
);

export const PrimaryColorText = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 700,
  color: theme.palette.primaryColor,
}));

export const GreyColorText = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 700,
  color: theme.palette.textColor,
}));

export const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  borderRadius: theme.palette.borderRadius_sm,
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

export const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon
        sx={{
          fontSize: "0.9rem",
          // color: (theme) => theme.palette.innerTextColor,
        }}
      />
    }
    {...props}
  />
))(({ theme }) => ({
  minHeight: "unset",
  // backgroundColor: theme.palette.primaryColor,
  // color: theme.palette.innerTextColor,
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    borderRadius: theme.palette.borderRadius_sm,
    justifyContent: "space-between",
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.buttonBgColorPrimary,
  color: theme.palette.buttonTextColorPrimary,
  transition: "transform 0.3s ease",
  ":hover": {
    backgroundColor: theme.palette.buttonBgColorPrimary,
    color: theme.palette.buttonTextColorPrimary,
    transform: "scale(1.15)",
  },
}));
