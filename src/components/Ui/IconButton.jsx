import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

export const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  padding: "8px 14px",
  height: "40px",
  gap: "6px",
  backgroundColor: theme.palette.common.white,
  border: `2px solid #BBBBBB8C`,
  color: theme.palette.grey.dark,
  borderRadius: theme.palette.borderRadius_sm,
  boxShadow: theme.shadows[1],
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
  },
}));
