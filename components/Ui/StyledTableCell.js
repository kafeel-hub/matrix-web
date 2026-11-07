import { styled } from "@mui/material/styles";
import { TableCell, } from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
    //   backgroundColor: theme.palette.backgroundhead.default,
      // theme.palette.common.black,
    //   color: theme.palette.common.white,
      fontWeight: "bold",
      textAlign: "center",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      textAlign: "center",
      wordWrap: "break-word",
      border: "none",
      padding: "10px 2px 0 2px",
    },
  }));

  export {StyledTableCell}