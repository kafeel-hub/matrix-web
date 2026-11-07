// import React from "react";
// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Paper,
// } from "@mui/material";
// import Grid from "@mui/material/Grid2";

// import DeleteIcon from "@mui/icons-material/Delete";
// import CustomButton from "./CustomButton";
// function Popup(props) {
//   const { show, setShow, handleConfirm, message, description, btnTxt } = props;
//   console.log(description, "description");
//   return (
//     <Dialog open={show} onClose={() => setShow(false)}>
//       <Paper sx={{ p: 2 }}>
//         <DialogTitle>{message}</DialogTitle>
//         {description && (
//           <DialogContent>
//             <DialogContentText>
//               {Array.isArray(description) ? (
//                 <ul>
//                   {description.itemDetails.map((message, index) => (
//                     <li key={index}>{message}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>{description}</p>
//               )}
//             </DialogContentText>
//           </DialogContent>
//         )}

//         <DialogActions>
//           <Grid container spacing={3}>
//             <Grid size={{ xs: 12, md: 6, lg: 6 }}>
//               <CustomButton onClick={() => setShow(false)} text={btnTxt} />
//             </Grid>
//             {handleConfirm && (
//               <Grid size={{ xs: 12, md: 6, lg: 6 }}>
//                 <CustomButton
//                   onClick={handleConfirm}
//                   variant="contained"
//                   text="Yes"
//                   //   theme={theme}
//                   fullWidth
//                   //   sx={{ mt: 2 }}
//                   variantType="dark"
//                 />
//               </Grid>
//             )}
//           </Grid>
//         </DialogActions>
//       </Paper>
//     </Dialog>
//   );
// }

// export default Popup;
import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "./CustomButton";

function Popup(props) {
  const {
    show,
    setShow,
    handleConfirm,
    message,
    description,
    btnTxt = "No",
    okOnly = false,
  } = props;

  return (
    <Dialog open={show} onClose={() => setShow(false)}>
      <Paper sx={{ p: 2 }}>
        {/* <Box>
      <DeleteIcon color="error" />
        </Box> */}
        <DialogTitle>{message}</DialogTitle>
        {description && (
          <DialogContent>
            <DialogContentText>
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                <>
                  {Object.entries(description).map(([key, error]) => (
                    <div key={key}>
                      {key === "itemDetails" ? (
                        Object.entries(error).map(([itemKey, itemError]) => (
                          <ul key={itemKey}>
                            <li>{itemError}</li>
                          </ul>
                        ))
                      ) : (
                        <p>{error}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </DialogContentText>
          </DialogContent>
        )}

        <DialogActions>
          <Grid container spacing={2}>
            {okOnly ? (
              // ✅ OK-only mode (for validation / error popups)
              <Grid size={{ xs: 12 }}>
                <CustomButton
                  onClick={() => setShow(false)}
                  text="Ok"
                  fullWidth
                  variant="contained"
                  variantType="dark"
                />
              </Grid>
            ) : (
              // ✅ Normal Yes/No mode (for confirmation popups)
              <>
                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                  <CustomButton onClick={() => setShow(false)} text={btnTxt} />
                </Grid>
                {handleConfirm && (
                  <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                    <CustomButton
                      onClick={handleConfirm}
                      variant="contained"
                      text="Yes"
                      fullWidth
                      variantType="dark"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogActions>
      </Paper>
    </Dialog>
  );
}

export default Popup;
