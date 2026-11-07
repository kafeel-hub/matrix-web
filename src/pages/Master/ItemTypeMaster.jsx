import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, Divider } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDispatch, useSelector } from "react-redux";
import MainHeading from "../../components/Common/MainHeading";
import CustomButton from "../../components/Customcomponents/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CommonTable from "../../components/CustomTable/CommonTable";
import ItemTypeMasterForm from "../../components/Master/ItemTypeMasterForm";
import Loader from "../../components/Loader/Loader";
import Popup from "../../components/Customcomponents/Popup";
import { sessionRefreshed } from "../../features/auth/authSlice";
import { listItemTypes, getItemType, createItemType, updateItemType, deactivateItemType } from "../../services/itemClassificationApi";

const emptyForm = {
  ItmCodeId: "", ItmCodeName: "", ItmCodeNameArb: "", ItmCodeStockFlag: 0,
  ItmCodeStatus: 0, ItmCodePrefix: "", ItmTypePurActNo: "", ItmTypeSaleActNo: "",
  ItmTypeSaleCostActNo: "", ItmTypeStockActNo: "", ItmTypeDefault: 0,
  ItmGoldPurityNo: "", ItmTypeNature: 0,
};

const toForm = (x) => ({
  ...emptyForm, ItmCodeId: x.itemTypeId || "", ItmCodeName: x.name || "",
  ItmCodeNameArb: x.nameArabic || "", ItmCodePrefix: x.prefix || "",
  ItmTypePurActNo: x.purchaseAccountNo || "", ItmTypeSaleActNo: x.salesAccountNo || "",
  ItmTypeSaleCostActNo: x.salesCostAccountNo || "", ItmTypeStockActNo: x.stockAccountNo || "",
  ItmCodeStockFlag: Number(x.stockFlag ?? 0), ItmTypeDefault: Number(x.isDefault ?? 0),
  ItmGoldPurityNo: x.purePurity ?? "", ItmTypeNature: Number(x.nature ?? 0), ItmCodeStatus: Number(x.status ?? 0),
});

function ItemTypeMaster() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});
  const session = { accessToken: auth.accessToken, refreshToken: auth.refreshToken, tenantKey: auth.tenantKey };
  const refresh = (tokens) => dispatch(sessionRefreshed(tokens));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState("");
  const [popup, setPopup] = useState({ show:false, message:"", description:"", okOnly:true });
  const [deleteRow, setDeleteRow] = useState(null);

  const showMessage = (message, description) => setPopup({ show:true, message, description, okOnly:true });
  const load = async () => {
    if (!session.accessToken || !session.tenantKey) return;
    setLoading(true);
    try { setRows((await listItemTypes({ session, onSessionRefreshed:refresh })) || []); }
    catch (e) { showMessage("Unable to load Item Types", e?.message || "Request failed."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [auth.accessToken, auth.tenantKey]);

  const handleOpen = () => { setEditingId(""); setFormData(emptyForm); setErrors({}); setModalOpen(true); };
  const handleChange = (name, value) => { setFormData((p) => ({...p,[name]:value})); setErrors((p)=>({...p,[name]:""})); };
  const handleEdit = async (row) => {
    setLoading(true);
    try { const x=await getItemType({itemTypeId:row.itemTypeId,session,onSessionRefreshed:refresh}); setEditingId(x.itemTypeId); setFormData(toForm(x)); setErrors({}); setModalOpen(true); }
    catch(e){ showMessage("Unable to load Item Type",e?.message||"Request failed."); }
    finally{setLoading(false);}
  };
  const handleSubmit = async () => {
    const next={};
    if(!String(formData.ItmCodeId||"").trim()) next.ItmCodeId="Code is required";
    if(!String(formData.ItmCodeName||"").trim()) next.ItmCodeName="Description is required";
    if(String(formData.ItmCodeId||"").trim().length>2) next.ItmCodeId="Code cannot exceed 2 characters";
    if(String(formData.ItmCodePrefix||"").trim().length>1) next.ItmCodePrefix="Prefix cannot exceed 1 character";
    if(Object.keys(next).length){setErrors(next);return;}
    const request={
      itemTypeId:String(formData.ItmCodeId).trim(), name:String(formData.ItmCodeName).trim(),
      nameArabic:String(formData.ItmCodeNameArb||formData.ItmCodeName).trim(), prefix:String(formData.ItmCodePrefix||"").trim()||null,
      purchaseAccountNo:String(formData.ItmTypePurActNo||"").trim()||null, salesAccountNo:String(formData.ItmTypeSaleActNo||"").trim()||null,
      salesCostAccountNo:String(formData.ItmTypeSaleCostActNo||"").trim()||null, stockAccountNo:String(formData.ItmTypeStockActNo||"").trim()||null,
      stockFlag:Number(formData.ItmCodeStockFlag||0), isDefault:Number(formData.ItmTypeDefault||0), purePurity:Number(formData.ItmGoldPurityNo||0),
      nature:Number(formData.ItmTypeNature||0), status:Number(formData.ItmCodeStatus||0),
    };
    setLoading(true);
    try{
      if(editingId) await updateItemType({itemTypeId:editingId,request,session,onSessionRefreshed:refresh});
      else await createItemType({request,session,onSessionRefreshed:refresh});
      setModalOpen(false); setEditingId(""); await load(); showMessage("Success",`Item Type ${request.itemTypeId} ${editingId?"updated":"saved"} successfully.`);
    }catch(e){setErrors((p)=>({...p,general:e?.message||"Unable to save Item Type."})); showMessage("Unable to save Item Type",e?.message||"Request failed.");}
    finally{setLoading(false);}
  };
  const askDeactivate=(row)=>{setDeleteRow(row);setPopup({show:true,message:"Deactivate Item Type",description:`Deactivate ${row.itemTypeId} - ${row.name}?`,okOnly:false});};
  const confirmDeactivate=async()=>{const row=deleteRow;setPopup((p)=>({...p,show:false}));if(!row)return;setLoading(true);try{await deactivateItemType({itemTypeId:row.itemTypeId,session,onSessionRefreshed:refresh});await load();showMessage("Success",`Item Type ${row.itemTypeId} deactivated successfully.`);}catch(e){showMessage("Unable to deactivate Item Type",e?.message||"Request failed.");}finally{setDeleteRow(null);setLoading(false);}};

  const columns=[
    {field:"itemTypeId",headerName:"Item Code",flex:1,align:"center",headerAlign:"center"},
    {field:"name",headerName:"Description",flex:1,align:"center",headerAlign:"center"},
    {field:"nameArabic",headerName:"Description (Arabic)",flex:1,align:"center",headerAlign:"center"},
    {field:"stockFlagName",headerName:"Stock Type",flex:1,align:"center",headerAlign:"center"},
    {field:"statusName",headerName:"Status",flex:1,align:"center",headerAlign:"center"},
    {field:"actions",headerName:"Actions",type:"actions",flex:1,align:"center",headerAlign:"center",renderCell:(p)=><div className="action-btn-container"><EditIcon onClick={()=>handleEdit(p.row)} color="success"/><DeleteIcon onClick={()=>askDeactivate(p.row)} color="error"/></div>},
  ];
  const tableRows=rows.map((x,i)=>({...x,id:`${x.itemTypeId}-${i}`,stockFlagName:Number(x.stockFlag)===0?"YES":"NO",statusName:Number(x.status)===0?"Active":"De-Active"}));
  return <><div className="main-section">{loading&&<Loader/>}<MainHeading heading="Item Type"/><Paper className="custom-card_001" bgcolor={theme.palette.background.default} sx={{maxWidth:"100%",width:"100%",textAlign:"center"}}><Box sx={{p:2}}><Grid container spacing={3}><Grid size={{xs:6,md:3,lg:2}}><CustomButton text="Add" variant="contained" theme={theme} fullWidth sx={{mt:2}} variantType="dark" onClick={handleOpen} BtnIcon={AddIcon}/></Grid></Grid></Box><Divider sx={{mt:2}}/><ItemTypeMasterForm modalOpen={modalOpen} setModalOpen={setModalOpen} formData={formData} onFormChange={handleChange} handleSubmit={handleSubmit} errors={errors} isEdit={!!editingId}/><CommonTable columns={columns} rows={tableRows}/></Paper></div><Popup show={popup.show} setShow={(show)=>setPopup((p)=>({...p,show}))} handleConfirm={popup.okOnly?undefined:confirmDeactivate} message={popup.message} description={popup.description} okOnly={popup.okOnly}/></>;
}
export default ItemTypeMaster;
