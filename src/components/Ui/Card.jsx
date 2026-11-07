import { styled } from "@mui/material/styles";
import { Card } from "@mui/material";

export const SectionCardStyled = styled(Card)(({ theme }) => ({
  padding: "25px 25px",
  borderRadius: theme.palette.borderRadius_sm,
  boxShadow: "none",
  backgroundColor: (theme) => theme.palette.common.white,
}));
