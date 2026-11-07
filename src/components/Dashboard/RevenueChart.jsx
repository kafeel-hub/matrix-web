import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Doughnut } from "react-chartjs-2";

const RevenueChart = ({ data, title }) => {
  return (
    <Paper
      sx={{
        background: "#171936",
        border: "1px solid #2b2d4f",
        borderRadius: 2,
        p: 1.5,
        height: 255,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography sx={{ fontSize: 11 }}>📊</Typography>

        <Typography
          sx={{
            color: "#f0c33c",
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          height: 190,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",

            plugins: {
              legend: {
                position: "bottom",

                labels: {
                  color: "#9ea3d1",
                  boxWidth: 28,
                  boxHeight: 8,
                  padding: 14,

                  font: {
                    size: 9,
                  },
                },
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default RevenueChart;
