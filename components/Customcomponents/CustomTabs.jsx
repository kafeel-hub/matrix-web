// src/components/CustomTabs.js

import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';

const CustomTabs = ({
  tabs = [],
  value,
  onChange,
  styles = {},
  centered = true,
}) => {
  return (
    <Box sx={{ ...styles, display: 'flex', justifyContent: centered ? 'center' : 'flex-start', width: '100%' , marginTop:"20px"}}>
      <Tabs
        value={value}
        onChange={onChange}
        aria-label="Tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            // backgroundColor: 'transparent', 
            backgroundColor: '#068e44', 
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
          key={index}
          label={tab.label}
          id={`tab-${index}`}
          sx={{
            '&.Mui-selected': {
              color: '#068e44', 
              // background:"#068e44",

            },
            '&:hover': {
              backgroundColor: '#eff8f4', 
              color:"#068e44"
            },
            '&.Mui-focusVisible': {
              backgroundColor: '#e1e1e1',
            },
            gap:"10px"
          }}
        />
        ))}
      </Tabs>
      {/* {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))} */}
    </Box>
  );
};

export default CustomTabs;
