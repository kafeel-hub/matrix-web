"use client";
import React, { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import Loader from "../Loader/Loader";
import { Paper, Box } from "@mui/material";

const CommonTable = ({ rows, columns, handleEdit, loading }) => {
  const theme = useTheme();

  const paginationModel = { page: 0, pageSize: 10 };
  return (
    <>
      {loading && <Loader />}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10, 20]}
          getRowSpacing={(params) => ({
            top: params.isFirstVisible ? 0 : 10,
            bottom: params.isFirstVisible ? 0 : 5,
          })}
          // checkboxSelection
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#00a76f",
              color: "#ffffff",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#00a76f",
              color: "#ffffff",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
            },
            "& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton": {
              color: "#ffffff",
            },
            [`& .${gridClasses.row}`]: {
              bgcolor: (theme) => theme.palette.background,
            },
          }}
          // onRowClick={handleEdit}
        />
      </Box>
    </>
  );
};
export default CommonTable;
