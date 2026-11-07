import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";

const ProfitChart = ({ data, title }) => {
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
        <Typography sx={{ fontSize: 11 }}>📈</Typography>

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

      <Box sx={{ height: 190 }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false,
              },
            },

            scales: {
              x: {
                ticks: {
                  color: "#9ea3d1",
                  font: {
                    size: 9,
                  },
                },

                grid: {
                  color: "rgba(255,255,255,0.05)",
                },
              },

              y: {
                ticks: {
                  color: "#9ea3d1",
                  font: {
                    size: 9,
                  },
                },

                grid: {
                  color: "rgba(255,255,255,0.05)",
                },
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default ProfitChart;
