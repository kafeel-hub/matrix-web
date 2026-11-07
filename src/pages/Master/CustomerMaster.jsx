import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, Divider } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import Grid from "@mui/material/Grid2";
import MainHeading from "../../components/Common/MainHeading";
import CustomButton from "../../components/Customcomponents/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CommonTable from "../../components/CustomTable/CommonTable";
import CustomerForm from "../../components/Master/CustomerForm";
import { defaultFormValues, customerMasterFormRequiredField } from "../../constants/CustomerMasterConstant";
import { validateForm } from "../../utilities/Validator/FormValidators";
import Loader from "../../components/Loader/Loader";
import { listParties, getParty, getPartyAccountGroups, createParty, updateParty } from "../../services/partyMasterApi";
import { buildPartyRequest, detailToLegacyForm } from "../../services/partyMasterMapper";
import { sessionRefreshed } from "../../features/auth/authSlice";

function CustomerMaster({ comboBox }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});
  const session = { accessToken: auth.accessToken, refreshToken: auth.refreshToken, tenantKey: auth.tenantKey };
  const refresh = (tokens) => dispatch(sessionRefreshed(tokens));

  const [rows, setRows] = useState([]);
  const [accountGroups, setAccountGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(defaultFormValues);
  const [currentItem, setCurrentItem] = useState(null);

  const load = async () => {
    if (!session.accessToken || !session.tenantKey) return;
    setLoading(true);
    try {
      const [parties, groups] = await Promise.all([
        listParties({ kind: "customer", session, onSessionRefreshed: refresh }),
        getPartyAccountGroups({ kind: "customer", session, onSessionRefreshed: refresh }),
      ]);
      setRows((parties || []).map((p, i) => ({
        id: i + 1, Prt_Id: p.partyId, Prt_Name: p.name, Prt_CivilId: p.civilId || "",
        Prt_Phone: p.phone || "", Prt_Balance: 0, Prt_BalanceGold: 0,
      })));
      setAccountGroups(groups || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [auth.accessToken, auth.tenantKey]);

  const handleOpen = () => {
    const def = accountGroups.find((x) => x.isDefault);
    setCurrentItem(null);
    setFormData({ ...defaultFormValues, clActNo: def?.accountNo || "", clCode: "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleAccountGroup = (accountNo) => {
    setFormData((prev) => ({ ...prev, clActNo: String(accountNo || "") }));
    setErrors((prev) => ({ ...prev, clActNo: "", clCode: "" }));
  };

  const handleEdit = async (item) => {
    setLoading(true);
    try {
      const detail = await getParty({
        kind: "customer",
        partyId: item.Prt_Id,
        session,
        onSessionRefreshed: refresh,
      });
      setCurrentItem(item);
      setFormData(detailToLegacyForm(detail, defaultFormValues));
      setErrors({});
      setModalOpen(true);
    } catch (e) {
      setErrors((p) => ({ ...p, general: e?.message || "Unable to load customer." }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(customerMasterFormRequiredField.filter(x => x.key !== "clCode"), setErrors, formData)) return;
    if (!formData.clActNo) { setErrors((p) => ({ ...p, clActNo: "Group of Accounts is required" })); return; }
    setLoading(true);
    try {
      const request = buildPartyRequest(formData);
      if (currentItem?.Prt_Id) {
        await updateParty({
          kind: "customer",
          partyId: currentItem.Prt_Id,
          request,
          session,
          onSessionRefreshed: refresh,
        });
      } else {
        await createParty({ kind: "customer", request, session, onSessionRefreshed: refresh });
      }
      setModalOpen(false);
      setCurrentItem(null);
      await load();
    } catch (e) {
      setErrors((p) => ({ ...p, general: e?.message || "Unable to save customer." }));
    } finally { setLoading(false); }
  };

  const columns = [
    { field:"Prt_Id", headerName:"Party Id", width:100, sortable:false, flex:1, align:"center", headerAlign:"center" },
    { field:"Prt_Name", headerName:"Party Name", width:90, sortable:false, flex:1, align:"center", headerAlign:"center" },
    { field:"Prt_CivilId", headerName:"Civil Id", type:"number", width:120, sortable:false, flex:1, align:"center", headerAlign:"center" },
    { field:"Prt_Phone", headerName:"Party Phone", type:"number", width:120, sortable:false, flex:1, align:"center", headerAlign:"center" },
    { field:"Prt_Balance", headerName:"Party Balance", sortable:false, filterable:true, width:130, flex:1, align:"center", headerAlign:"center" },
    { field:"Prt_BalanceGold", headerName:"Prty Balance Gold", width:120, sortable:false, disableColumnMenu:true, flex:1, align:"center", headerAlign:"center" },
    { field:"actions", headerName:"Actions", type:"actions", width:90, renderCell:(params)=> <div className="action-btn-container"><EditIcon onClick={()=>handleEdit(params.row)} color="success"/><DeleteIcon color="error"/></div>, disableColumnMenu:true, sortable:false, flex:1, align:"center", headerAlign:"center" },
  ];

  const formCombo = { ...comboBox, act: accountGroups.map(x => ({ fldID:x.accountNo, fldDisplay:x.accountName })) };

  return <>
    {loading && <Loader />}
    <div className="main-section">
      <MainHeading heading={"Customer"} />
      <Paper className="custom-card_001" bgcolor={theme.palette.background.default} sx={{maxWidth:"100%",width:"100%",textAlign:"center"}}>
        <Box sx={{p:2}}><Grid container spacing={3} sx={{flexGrow:1}}><Grid size={{xs:6,md:3,lg:2}}>
          <CustomButton text="Add" variant="contained" theme={theme} fullWidth sx={{mt:2}} variantType="dark" onClick={handleOpen} BtnIcon={AddIcon}/>
        </Grid></Grid></Box>
        <Divider sx={{mt:2}} />
        <CustomerForm modalOpen={modalOpen} setModalOpen={setModalOpen} formData={formData} onFormChange={handleChange}
          handleSubmit={handleSubmit} errors={errors} data={formCombo} handleFetchCreditCustomerInfo={handleAccountGroup}
          currentItem={currentItem} setCurrentItem={setCurrentItem}/>
        <CommonTable columns={columns} rows={rows}/>
      </Paper>
    </div>
  </>;
}
const mapStateToProps = ({auth={}}) => ({ comboBox: _.get(auth,"comboBox",[]) });
export default connect(mapStateToProps)(CustomerMaster);
