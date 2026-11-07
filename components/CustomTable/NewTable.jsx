import React, { useState, useEffect } from "react";
import "./style.css";
import Grid from "@mui/material/Grid2";
import CustomDropdown from "../Customcomponents/CustomDropdown";
import InputFieldUpdated from "../Customcomponents/CustomInputfield";
import { IconButton, Button, Typography, Box } from "@mui/material";
import {
  calculateGoldRetailPricePerGm,
  calculateGoldRetailAmount,
  calculateGoldRetailPrice,
  calculatePureWeight,
} from "../../utilities/TableCalculations/GoldRetail";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Popup from "../Customcomponents/Popup";
import CustomSelect from "../Customcomponents/CustomInputs";
import CustomButton from "../Customcomponents/CustomButton";
function NewTable(props) {
  const {
    fieldData,
    options,
    fetchProductDetails,
    rows,
    setRows,
    initialRow,
    currentItem,
    setCurrentItem,
    loading,
    type,
  } = props;
  const [showPopup, setShowPopup] = useState(false);

  const addRow = () => {
    setRows([...rows, { ...initialRow, id: Date.now().toString() }]);
  };

  const deleteRow = (id) => {
    setShowPopup(true);
    setCurrentItem(id);
  };

  const handleDeleteConfirm = () => {
    const updatedRows = rows.filter((row) => row.id !== currentItem);
    setRows(updatedRows);
    setShowPopup(false);
  };
  console.log(type, "type");
  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: value };
        if (type == "scrapPurchase" || type == "GI") {
          updatedRow.netWt = updatedRow.grossWt - updatedRow.deductionWt;
        } else {
          if (field === "grossWt" || field === "stoneWt") {
            updatedRow.netWt =
              parseFloat(updatedRow.grossWt || 0) -
              parseFloat(updatedRow.stoneWt || 0);
          }
        }

        if (
          [
            "grossWt",
            "stoneWt",
            "goldPrice",
            "stoneAmount",
            "mcPerGm",
            "qty",
          ].includes(field) ||
          ["pureWeight", "goldPrice", "qty"].includes(field)
        ) {
          {
            type == "scrapPurchase" || type == "UGLP" || type == "GI"
              ? (updatedRow.pureWeight = calculatePureWeight({
                  netWt: updatedRow.netWt,
                  purity: updatedRow.purity,

                  digits: 3,
                }))
              : (updatedRow.unitPricePerGm = calculateGoldRetailPricePerGm({
                  grossWgt: updatedRow.grossWt,
                  stoneWgt: updatedRow.stoneWt,
                  goldPrice: updatedRow.goldPrice,
                  stoneAmount: updatedRow.stoneAmount,
                  mcgm: updatedRow.mcPerGm,
                  digits: 3,
                }));
          }
          {
            type == "scrapPurchase" || type == "GI"
              ? (updatedRow.price = updatedRow.goldPrice)
              : (updatedRow.price = calculateGoldRetailPrice({
                  grossWgt: updatedRow.grossWt,
                  stoneWgt: updatedRow.stoneWt,
                  goldPrice: updatedRow.goldPrice,
                  stoneAmount: updatedRow.stoneAmount,
                  mcgm: updatedRow.mcPerGm,
                  digits: 3,
                }));
          }

          updatedRow.amount = calculateGoldRetailAmount({
            price: updatedRow.price,
            qty:
              type == "scrapPurchase" || type == "UGLP" || type == "GI"
                ? updatedRow.pureWeight
                : updatedRow.qty,
            digits: 3,
          });
        }
        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSelectChange = (index, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, itemCode: value } : row
    );
    setRows(updatedRows);
    fetchProductDetails(value && value.value);
  };

  return (
    <div className="">
      <Box>
        <Typography sx={{ textAlign: "left" }} component={"h2"}>
          Details
        </Typography>
      </Box>
      {rows.map((row, index) => (
        <div key={index} className="table-row">
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 1, md: 1, lg: 1 }}
              style={{ marginTop: "0px", marginBottom: "7px" }}
              className="delete-btn-container sn-no-custom-width"
            >
              <div className="cell custom-table-cell">
                <span className="label">Sr. No.</span>
                <span>{index + 1}</span>
              </div>
            </Grid>
            <Grid size={{ xs: 10, md: 4, lg: 3 }}>
              <div className="custom-table-cell">
                <span className="label">Item Code</span>
                <CustomDropdown
                  value={row.itemCode}
                  onChange={(_, value) =>
                    handleSelectChange(index, value || "")
                  }
                  options={options}
                />
              </div>
            </Grid>
            <Grid
              size={{ xs: 10, md: 5, lg: 3 }}
              offset={{ xs: 1, md: 0, lg: 0 }}
            >
              <div className="custom-table-cell">
                <span className="label">Description</span>
                <InputFieldUpdated
                  type={"text"}
                  value={row.description}
                  min={0}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                />
              </div>
            </Grid>
            {type !== "UGLP" && type !== "GI" && (
              <Grid
                size={{ xs: 10, md: 4, lg: 2 }}
                className="custom-width"
                offset={{ xs: 1, md: 0, lg: 0 }}
              >
                <div className="custom-table-cell">
                  <span className="label">Gold Price</span>
                  <InputFieldUpdated
                    type={"number"}
                    value={row.goldPrice}
                    min={0}
                    onChange={(e) =>
                      handleInputChange(index, "goldPrice", e.target.value)
                    }
                  />
                </div>
              </Grid>
            )}
            <Grid
              size={{ xs: 10, md: 2, lg: 1 }}
              offset={{ xs: 1, md: 0, lg: 0 }}
            >
              <div className="custom-table-cell">
                <span className="label">Gross Wt</span>
                <InputFieldUpdated
                  type={"number"}
                  value={row.grossWt}
                  min={0}
                  onChange={(e) =>
                    handleInputChange(index, "grossWt", e.target.value)
                  }
                />
              </div>
            </Grid>
            {type !== "scrapPurchase" && type !== "GI" && (
              <Grid
                size={{ xs: 10, md: 2, lg: 1 }}
                offset={{ xs: 1, md: 0, lg: 0 }}
              >
                <div className="custom-table-cell">
                  <span className="label">Stone Wt</span>
                  <InputFieldUpdated
                    type={"number"}
                    value={row.stoneWt}
                    min={0}
                    onChange={(e) =>
                      handleInputChange(index, "stoneWt", e.target.value)
                    }
                  />
                </div>
              </Grid>
            )}
            {(type == "scrapPurchase" || type == "GI") && (
              <>
                <Grid
                  size={{ xs: 10, md: 2, lg: 1 }}
                  offset={{ xs: 1, md: 0, lg: 0 }}
                >
                  <div className="custom-table-cell">
                    <span className="label">Deduction %</span>
                    <InputFieldUpdated
                      type={"number"}
                      value={row.deductionPrcnt}
                      min={0}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "deductionPrcnt",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </Grid>
                <Grid
                  size={{ xs: 10, md: 2, lg: 1 }}
                  offset={{ xs: 1, md: 0, lg: 0 }}
                >
                  <div className="custom-table-cell">
                    <span className="label">Deduction Weight</span>
                    <InputFieldUpdated
                      type={"number"}
                      value={row.deductionWt}
                      min={0}
                      onChange={(e) =>
                        handleInputChange(index, "deductionWt", e.target.value)
                      }
                    />
                  </div>
                </Grid>
              </>
            )}
            {(type == "scrapPurchase" || type == "GI" || type == "UGLP") && (
              <Grid
                size={{ xs: 10, md: 2, lg: 1 }}
                offset={{ xs: 1, md: 0, lg: 0 }}
              >
                <div className="custom-table-cell">
                  <span className="label">Pure Weight</span>
                  <InputFieldUpdated
                    type={"number"}
                    value={row.pureWeight}
                    min={0}
                    onChange={(e) =>
                      handleInputChange(index, "pureWeight", e.target.value)
                    }
                  />
                </div>
              </Grid>
            )}
            <Grid
              size={{ xs: 10, md: 2, lg: 1 }}
              offset={{ xs: 1, md: 0, lg: 0 }}
            >
              <div className="custom-table-cell">
                <span className="label">Net Wt</span>
                <InputFieldUpdated
                  type={"number"}
                  value={row.netWt}
                  min={0}
                  disabled={true}
                  onChange={(e) =>
                    handleInputChange(index, "netWt", e.target.value)
                  }
                />
              </div>
            </Grid>
            {type !== "scrapPurchase" && type !== "GI" && (
              <>
                <Grid
                  size={{ xs: 10, md: 2, lg: 1 }}
                  // offset={{ xs: 1, md: 2, lg: 4 }}
                >
                  <div className="custom-table-cell">
                    <span className="label">MC Per Gm</span>
                    <InputFieldUpdated
                      type={"number"}
                      value={row.mcPerGm}
                      min={0}
                      onChange={(e) =>
                        handleInputChange(index, "mcPerGm", e.target.value)
                      }
                    />
                  </div>
                </Grid>
                <Grid
                  size={{ xs: 10, md: 2, lg: 1 }}
                  offset={{ xs: 1, md: 0, lg: 0 }}
                >
                  <div className="custom-table-cell">
                    <span className="label">Purity</span>

                    <InputFieldUpdated
                      type={"number"}
                      value={row.purity}
                      min={0}
                      disabled={true}
                      onChange={(e) =>
                        handleInputChange(index, "purity", e.target.value)
                      }
                    />
                  </div>
                </Grid>
                {type !== "UGLP" && (
                  <Grid
                    size={{ xs: 10, md: 2, lg: 2 }}
                    offset={{ xs: 1, md: 0, lg: 0 }}
                  >
                    <div className="custom-table-cell">
                      <span className="label">Unit Price/gm</span>
                      <InputFieldUpdated
                        type={"number"}
                        value={row.unitPricePerGm}
                        min={0}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "unitPricePerGm",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </Grid>
                )}
                {type == "UGLP" && (
                  <Grid
                    size={{ xs: 10, md: 2, lg: 2 }}
                    offset={{ xs: 1, md: 0, lg: 0 }}
                  >
                    <div className="custom-table-cell">
                      <span className="label">Stone Amount</span>
                      <InputFieldUpdated
                        type={"number"}
                        value={row.stoneAmount}
                        min={0}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "stoneAmount",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </Grid>
                )}
              </>
            )}
            {/* {type == "UGLP" && (/ */}
            <Grid
              size={{ xs: 10, md: 4, lg: 2 }}
              offset={{ xs: 1, md: 0, lg: 0 }}
            >
              <div className="custom-table-cell">
                <span className="label">Price</span>
                <InputFieldUpdated
                  type={"number"}
                  value={row.price}
                  min={0}
                  disabled={true}
                  onChange={(e) =>
                    handleInputChange(index, "price", e.target.value)
                  }
                />
              </div>
            </Grid>
            {/* )} */}
            <Grid
              size={{ xs: 10, md: 2, lg: 1 }}
              offset={{ xs: 1, md: 0, lg: 0 }}
            >
              <div className="custom-table-cell">
                <span className="label">Qty</span>
                <InputFieldUpdated
                  type={"number"}
                  value={row.qty}
                  min={0}
                  onChange={(e) =>
                    handleInputChange(index, "qty", e.target.value)
                  }
                />
              </div>
            </Grid>
            {type !== "GI" && (
              <Grid
                size={{ xs: 10, md: 4, lg: 2 }}
                offset={{ xs: 1, md: 0, lg: 0 }}
              >
                <div className="custom-table-cell">
                  <span className="label">Amount</span>
                  <InputFieldUpdated
                    type={"number"}
                    value={row.amount}
                    min={0}
                    disabled={true}
                    onChange={(e) =>
                      handleInputChange(index, "amount", e.target.value)
                    }
                  />
                </div>
              </Grid>
            )}

            <Grid
              size={{ xs: 4, md: 1, lg: 1 }}
              offset={{ xs: 10, md: 0, lg: 0 }}
              className="delete-btn-container"
            >
              <div className="custom-table-cell">
                <IconButton onClick={() => deleteRow(row.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </div>
            </Grid>
          </Grid>
          <div className="divider" />
        </div>
      ))}

      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12, md: 12, lg: 12 }}
          sx={{ mt: 2, textAlign: "right" }}
        >
          {/* <Button
                        onClick={addRow}
                        variant="outlined"
                        // sx={{ mt: 2, alignSelf: "flex-start" }}
                        startIcon={<AddIcon />}
                    >
                        Add Item
                    </Button> */}

          <CustomButton
            onClick={addRow}
            text="Add Item"
            // theme={theme}
            // sx={{ mt: 2 }}
            variantType="dark"
            type="submit"
            disabled={loading}
            loading={loading}
            startIcon={<AddIcon />}
          />
        </Grid>
      </Grid>

      <Popup
        show={showPopup}
        setShow={setShowPopup}
        message={"Are you sure you want to delete?"}
        description=""
        handleConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default NewTable;
