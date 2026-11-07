import EditIcon from "@mui/icons-material/Edit";
import ViewIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

let defaultValues = {
    TranFinYear:"",
    TranLocId: 1,
    TranCompanyId: "1",
    ItmCodeType: "ITM_TYPE",
    ItmCodeId: "",
    ItmCodeName: "",
    ItmCodeNameArb: "",
    ItmCodeStockActNo: " ",
    ItmCodeStockFlag: "",
    ItmCodeStatus: "",
    ItmCodePrefix: "",
    ItmTypePurActNo: "",
    ItmTypeSaleActNo: "",
    ItmTypeSaleCostActNo: "",
    ItmTypeStockActNo: "",
    ItmTypeDefault: "",
    ItmGoldPurityNo: "",
  };


  const itemTypeMasterFormRequiredField = [
    // { key: "clName", message: "Customer Name is required" },
  ];



  const tableColumns = [
    {
      field: "aCode",
      headerName: "Item Code",
      width: 100,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "aName",
      headerName: "Description",
      width: 90,
      disableColumnMenu: false,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "aNameArb",
      headerName: "Description (Arabic)",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
      // disableColumnMenu: false,

    },
    {
      field: "ItemTypeStockFlagName",
      headerName: "Stock Type",
      type: "number",
      width: 120,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "ItemTypeStatusName",
      headerName: "Status",
      sortable: false,
      filterable: true,
      width: 130,
      // disableColumnMenu: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 90,
      renderCell: (params) => {
        return (
          <div className="action-btn-container">
            {/* <ViewIcon 
            // onClick={() => handleEdit(params)} 
            /> */}
            <EditIcon color="success" />
            <DeleteIcon color="error" />
          </div>
        );
      },
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];
    


  export  {defaultValues,itemTypeMasterFormRequiredField,tableColumns}