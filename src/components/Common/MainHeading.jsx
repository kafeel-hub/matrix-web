import React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";

function MainHeading({ heading }) {
  return (
    <Box sx={{ margin: "0px 0 8px 0" }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
          <Typography className="main-heading" component={"h1"}>
            {" "}
            {heading}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainHeading;
