import React from 'react'
import LoginStepTwoForm from '../components/Auth/LoginStepTwoForm'
import { Box } from '@mui/material'
import backgroundImage from "../assets/images/background.jpg";

function CompanyBranch() {
  return (
   <Box
   sx={{
     position: "relative",
     width: "100vw",
     height: "100vh",
     overflow: "hidden",
   }}
 >
   <Box
     sx={{
       position: "absolute",
       top: 0,
       left: 0,
       width: "100%",
       height: "100%",
       backgroundImage: `url(${backgroundImage})`,
       backgroundSize: "cover",
       backgroundPosition: "center",
       zIndex: -1,
       opacity: 0.2, 
     }}
   />

   <Box
     sx={{
       display: "flex",
       justifyContent: "center",
       alignItems: "center",
       height: "100%",
       zIndex: 1,
       padding:"1.2rem"
     }}
   >
        <LoginStepTwoForm />

   </Box>
 </Box>

  )
}

export default CompanyBranch