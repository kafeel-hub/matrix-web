import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import MainHeading from "../../components/Common/MainHeading";
import CustomButton from "../../components/Customcomponents/CustomButton";
import CommonTable from "../../components/CustomTable/CommonTable";
import Loader from "../../components/Loader/Loader";
import Popup from "../../components/Customcomponents/Popup";
import { sessionRefreshed } from "../../features/auth/authSlice";
import {
  createItem, deactivateItem, getItem, getNextItemCode, listCountries, listGoldPurities,
  listItemCategories, listItemDesigns, listItems, listItemSubcategories, listItemTypes,
  listSuppliers, updateItem,
} from "../../services/itemMasterApi";

const emptyForm = {
  itemId: "", supplierItemId: "", barcode: "", name: "", nameArabic: "",
  itemTypeId: "", categoryId: "", subcategoryId: "", countryId: "", designId: "", size: "",
  goldPurity: "", openingMakingCost: 0, averageMakingCost: 0, currentMakingCost: 0, supplierCost: 0,
  makingCostType: 0, costPriceType: 0, salePrice: 0, goldWeight: 0, stoneWeight: 0,
  supplierId: "", piecesStockFlag: 0, weightPerPiece: 0, stoneWeightPerPiece: 0,
  salePriceType: 0, goldPriceWeightType: 0, barcodeFlag: 0, barcodeSerialNo: 0, status: 0,
};
const n = (v) => Number(v || 0);
const text = (v) => String(v ?? "").trim();

function ItemMaster() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});
  const session = { accessToken: auth.accessToken, refreshToken: auth.refreshToken, tenantKey: auth.tenantKey };
  const refresh = (tokens) => dispatch(sessionRefreshed(tokens));
  const opts = () => ({ session, onSessionRefreshed: refresh });

  const [rows, setRows] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [purities, setPurities] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [countries, setCountries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteRow, setDeleteRow] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", description: "", okOnly: true });

  const showMessage = (message, description) => setPopup({ show: true, message, description, okOnly: true });

  const loadRows = async (term = search) => {
    if (!session.accessToken || !session.tenantKey) return;
    setLoading(true);
    try { setRows(await listItems({ search: term, pageSize: 200, ...opts() }) || []); }
    catch (e) { showMessage("Unable to load Items", e?.message || "Request failed."); }
    finally { setLoading(false); }
  };

  const loadLookups = async () => {
    if (!session.accessToken || !session.tenantKey) return;
    setLoading(true);
    try {
      const [types, categoryRows, purityRows, designRows, countryRows, supplierRows] = await Promise.all([
        listItemTypes(opts()), listItemCategories({ ...opts() }), listGoldPurities(opts()), listItemDesigns(opts()), listCountries(opts()), listSuppliers(opts()),
      ]);
      setItemTypes((types || []).filter((x) => n(x.status) === 0));
      setAllCategories(categoryRows || []);
      setPurities((purityRows || []).filter((x) => n(x.status) === 0));
      setDesigns((designRows || []).filter((x) => n(x.status) === 0));
      setCountries(countryRows || []);
      setSuppliers(supplierRows || []);
    } catch (e) { showMessage("Unable to load Item lookups", e?.message || "Request failed."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLookups(); loadRows(""); }, [auth.accessToken, auth.tenantKey]);

  const loadCategories = async (itemTypeId, preserve = "") => {
    if (!itemTypeId) { setCategories([]); setSubcategories([]); return; }
    const data = (await listItemCategories({ itemTypeId, ...opts() }) || []).filter((x) => n(x.status) === 0 || x.categoryId === preserve);
    setCategories(data);
  };
  const loadSubcategories = async (categoryId, preserve = "") => {
    if (!categoryId) { setSubcategories([]); return; }
    const data = (await listItemSubcategories({ categoryId, ...opts() }) || []).filter((x) => n(x.status) === 0 || x.subcategoryId === preserve);
    setSubcategories(data);
  };
  const generateCode = async (draft) => {
    if (editingId || !draft.itemTypeId || !draft.categoryId) return draft;
    try {
      const x = await getNextItemCode({ itemTypeId: draft.itemTypeId, categoryId: draft.categoryId, subcategoryId: draft.subcategoryId, ...opts() });
      return { ...draft, itemId: x?.itemId || draft.itemId };
    } catch (e) { showMessage("Unable to generate Item Code", e?.message || "Request failed."); return draft; }
  };

  const handleOpen = async () => {
    setEditingId(""); setErrors({});
    let draft = { ...emptyForm, itemTypeId: itemTypes[0]?.itemTypeId || "", goldPurity: purities[0]?.purityNo ?? "" };
    if (draft.itemTypeId) {
      const cats = (await listItemCategories({ itemTypeId: draft.itemTypeId, ...opts() }) || []).filter((x) => n(x.status) === 0);
      setCategories(cats); draft.categoryId = cats[0]?.categoryId || "";
      if (draft.categoryId) {
        const subs = (await listItemSubcategories({ categoryId: draft.categoryId, ...opts() }) || []).filter((x) => n(x.status) === 0);
        setSubcategories(subs); draft.subcategoryId = subs[0]?.subcategoryId || "";
      }
    }
    // Item code is generated by the API during POST. Avoid a separate next-code request when opening Add.
    setForm(draft); setOpen(true);
  };

  const handleEdit = async (row) => {
    setLoading(true);
    try {
      const x = await getItem({ itemId: row.itemId, ...opts() });
      setEditingId(x.itemId); setErrors({});
      await loadCategories(x.itemTypeId, x.categoryId); await loadSubcategories(x.categoryId, x.subcategoryId);
      setForm({ ...emptyForm, ...x }); setOpen(true);
    } catch (e) { showMessage("Unable to load Item", e?.message || "Request failed."); }
    finally { setLoading(false); }
  };

  const change = async (name, value) => {
    let draft = { ...form, [name]: value };
    setErrors((p) => ({ ...p, [name]: "" }));
    if (name === "itemTypeId") {
      const cats = (await listItemCategories({ itemTypeId: value, ...opts() }) || []).filter((x) => n(x.status) === 0);
      setCategories(cats); draft.categoryId = cats[0]?.categoryId || ""; draft.subcategoryId = "";
      if (draft.categoryId) {
        const subs = (await listItemSubcategories({ categoryId: draft.categoryId, ...opts() }) || []).filter((x) => n(x.status) === 0);
        setSubcategories(subs); draft.subcategoryId = subs[0]?.subcategoryId || "";
      } else setSubcategories([]);
    } else if (name === "categoryId") {
      const subs = (await listItemSubcategories({ categoryId: value, ...opts() }) || []).filter((x) => n(x.status) === 0);
      setSubcategories(subs); draft.subcategoryId = subs[0]?.subcategoryId || "";
    } else if (name === "subcategoryId") {
      // No client-side code reservation. The API generates the definitive item code on save.
    }
    else if (name === "goldWeight" || name === "stoneWeight") {
      // Net weight is derived in the UI exactly as the legacy form: Gross/Gold Weight - Stone Weight.
    }
    setForm(draft);
  };

  const validate = () => {
    const e = {};
    if (!text(form.name)) e.name = "Item Name is required";
    if (!text(form.itemTypeId)) e.itemTypeId = "Item Type is required";
    if (!text(form.categoryId)) e.categoryId = "Item Category is required";
    if (n(form.goldWeight) > 0 && n(form.stoneWeight) > n(form.goldWeight)) e.stoneWeight = "Stone Weight cannot exceed Gold Weight";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const request = {
      itemId: text(form.itemId) || null, supplierItemId: text(form.supplierItemId) || null, barcode: text(form.barcode) || null,
      name: text(form.name), nameArabic: text(form.nameArabic) || text(form.name), itemTypeId: text(form.itemTypeId), categoryId: text(form.categoryId),
      subcategoryId: text(form.subcategoryId) || null, countryId: text(form.countryId) || null, designId: text(form.designId) || null, size: text(form.size) || null,
      goldPurity: n(form.goldPurity), openingMakingCost: n(form.openingMakingCost || form.averageMakingCost), averageMakingCost: n(form.averageMakingCost),
      currentMakingCost: n(form.averageMakingCost), supplierCost: n(form.averageMakingCost), makingCostType: n(form.makingCostType),
      costPriceType: n(form.costPriceType), salePrice: n(form.salePrice), goldWeight: n(form.goldWeight), stoneWeight: n(form.stoneWeight), supplierId: text(form.supplierId) || null,
      purchaseDate: null, purchaseTransactionNo: 0, diamondClarity: null, diamondColor: null, diamondCut: null,
      piecesStockFlag: n(form.piecesStockFlag), weightPerPiece: n(form.weightPerPiece), stoneWeightPerPiece: n(form.stoneWeightPerPiece),
      salePriceType: n(form.costPriceType), goldPriceWeightType: n(form.goldPriceWeightType), barcodeFlag: n(form.barcodeFlag), barcodeSerialNo: n(form.barcodeSerialNo), status: n(form.status),
    };
    setLoading(true);
    try {
      const wasEdit = !!editingId;
      const result = wasEdit ? await updateItem({ itemId: editingId, request, ...opts() }) : await createItem({ request, ...opts() });
      setOpen(false); setEditingId(""); await loadRows("");
      showMessage("Success", result?.message || `Item ${result?.itemId || request.itemId || ""} ${wasEdit ? "updated" : "saved"} successfully.`);
    } catch (e) { showMessage("Unable to save Item", e?.message || "Request failed."); }
    finally { setLoading(false); }
  };

  const askDeactivate = (row) => { setDeleteRow(row); setPopup({ show: true, message: "Deactivate Item", description: `Deactivate ${row.itemId} - ${row.name}?`, okOnly: false }); };
  const confirmDeactivate = async () => {
    const row = deleteRow; setPopup((p) => ({ ...p, show: false })); if (!row) return;
    setLoading(true);
    try { await deactivateItem({ itemId: row.itemId, ...opts() }); await loadRows(); showMessage("Success", `Item ${row.itemId} deactivated successfully.`); }
    catch (e) { showMessage("Unable to deactivate Item", e?.message || "Request failed."); }
    finally { setDeleteRow(null); setLoading(false); }
  };

  const typeNames = useMemo(() => Object.fromEntries(itemTypes.map((x) => [x.itemTypeId, x.name])), [itemTypes]);
  const categoryNames = useMemo(() => Object.fromEntries(allCategories.map((x) => [x.categoryId, x.name])), [allCategories]);
  const columns = [
    { field: "itemId", headerName: "Item Code", flex: 1.1, minWidth: 120 },
    { field: "name", headerName: "Item Name", flex: 1.8, minWidth: 180 },
    { field: "barcode", headerName: "Barcode", flex: 1.2, minWidth: 120 },
    { field: "categoryName", headerName: "Category", flex: 1.2, minWidth: 130 },
    { field: "goldPurity", headerName: "Purity", flex: .7, minWidth: 80 },
    { field: "statusName", headerName: "Status", flex: .8, minWidth: 90 },
    { field: "actions", headerName: "Actions", type: "actions", flex: .8, minWidth: 100, renderCell: (p) => <div className="action-btn-container"><EditIcon onClick={() => handleEdit(p.row)} color="success"/><DeleteIcon onClick={() => askDeactivate(p.row)} color="error"/></div> },
  ];
  const tableRows = rows.map((x, i) => ({ ...x, id: `${x.itemId}-${i}`, categoryName: categoryNames[x.categoryId] || x.categoryId, itemTypeName: typeNames[x.itemTypeId] || x.itemTypeId, statusName: n(x.status) === 0 ? "Active" : "De-Active" }));
  const netWeight = Math.max(0, n(form.goldWeight) - n(form.stoneWeight));

  const field = (label, name, props = {}) => <TextField fullWidth size="small" label={label} value={form[name] ?? ""} onChange={(e) => change(name, e.target.value)} error={!!errors[name]} helperText={errors[name] || " "} {...props}/>;
  const select = (label, name, options, getValue, getLabel, props = {}) => <TextField select fullWidth size="small" label={label} value={form[name] ?? ""} onChange={(e) => change(name, e.target.value)} error={!!errors[name]} helperText={errors[name] || " "} {...props}>{props.allowBlank !== false && <MenuItem value="">-- Select --</MenuItem>}{options.map((x) => <MenuItem key={String(getValue(x))} value={getValue(x)}>{getLabel(x)}</MenuItem>)}</TextField>;

  return <>
    <div className="main-section">{loading && <Loader/>}<MainHeading heading="Item Master"/>
      <Paper className="custom-card_001" bgcolor={theme.palette.background.default} sx={{ maxWidth: "100%", width: "100%" }}>
        <Box sx={{ p: 2 }}><Grid container spacing={2} alignItems="center"><Grid size={{ xs: 12, md: 5 }}>{field("Search Item Code / Name / Barcode", "__search", { value: search, onChange: (e) => setSearch(e.target.value), helperText: " " })}</Grid><Grid size={{ xs: 6, md: 2 }}><CustomButton text="Search" variant="contained" theme={theme} fullWidth variantType="dark" onClick={() => loadRows(search)}/></Grid><Grid size={{ xs: 6, md: 2 }}><CustomButton text="Add" variant="contained" theme={theme} fullWidth variantType="dark" onClick={handleOpen} BtnIcon={AddIcon}/></Grid></Grid></Box>
        <Divider/><CommonTable columns={columns} rows={tableRows}/>
      </Paper>
    </div>

    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
      <DialogTitle sx={{ color: "#00A76F", fontWeight: 700 }}>{editingId ? `Edit Item - ${editingId}` : "Add Item"}</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Item General Information</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>{field("Item Code", "itemId", { disabled: !!editingId, inputProps: { maxLength: 30 } })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Barcode", "barcode", { disabled: !!editingId, inputProps: { maxLength: 15 } })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Supplier Item Code", "supplierItemId", { inputProps: { maxLength: 30 } })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Status", "status", [{v:0,n:"Active"},{v:1,n:"In-Active"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{field("Item Name", "name", { inputProps: { maxLength: 100 } })}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{field("Item Name (Arabic)", "nameArabic", { inputProps: { maxLength: 100 } })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Item Type", "itemTypeId", itemTypes, x=>x.itemTypeId, x=>`${x.itemTypeId} - ${x.name}`, { disabled: !!editingId, allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Item Category", "categoryId", categories, x=>x.categoryId, x=>`${x.categoryId} - ${x.name}`, { disabled: !!editingId, allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Sub-Category", "subcategoryId", subcategories, x=>x.subcategoryId, x=>`${x.subcategoryId} - ${x.name}`)}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Origin", "countryId", countries, x=>x.countryId, x=>`${x.countryId} - ${x.name}`)}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Design Type", "designId", designs, x=>x.designId, x=>`${x.designId} - ${x.name}`)}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Size / Length", "size", { inputProps: { maxLength: 12 } })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Purity", "goldPurity", purities, x=>x.purityNo, x=>`${x.purityNo} - ${x.description}`, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Item Supplier", "supplierId", suppliers, x=>x.partyId || x.supplierId, x=>`${x.partyId || x.supplierId} - ${x.partyName || x.supplierName || x.name || ""}`)}</Grid>
        </Grid>
        <Divider sx={{ my: 1 }}/><Typography sx={{ fontWeight: 700, mb: 2 }}>Cost / Price</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>{field("MC Cost", "averageMakingCost", { type:"number", inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("MC Type", "makingCostType", [{v:0,n:"Per Gms"},{v:1,n:"Per Pcs"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Sales Price", "salePrice", { type:"number", inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Price Type", "costPriceType", [{v:0,n:"Only MC"},{v:1,n:"Gold and MC"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Gold Price Apply", "goldPriceWeightType", [{v:0,n:"On Net Wt"},{v:1,n:"On Gross Wt"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
        </Grid>
        <Divider sx={{ my: 1 }}/><Typography sx={{ fontWeight: 700, mb: 2 }}>Stock / Barcode</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>{select("Barcoded (Y/N)", "barcodeFlag", [{v:0,n:"NO"},{v:1,n:"YES"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{select("Stock in Pcs", "piecesStockFlag", [{v:0,n:"Yes"},{v:1,n:"No"}], x=>x.v, x=>x.n, { allowBlank:false })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Gold / Gross Weight", "goldWeight", { type:"number", disabled:n(form.barcodeFlag)!==1, inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Stone Weight", "stoneWeight", { type:"number", disabled:n(form.barcodeFlag)!==1, inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth size="small" label="Net Weight" value={netWeight.toFixed(3)} disabled helperText=" "/></Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Weight Per Pcs", "weightPerPiece", { type:"number", inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Stone Wt Per Pcs", "stoneWeightPerPiece", { type:"number", inputProps:{min:0,step:"0.001"} })}</Grid>
          <Grid size={{ xs: 12, md: 3 }}>{field("Barcode Serial No", "barcodeSerialNo", { type:"number", disabled:n(form.barcodeFlag)!==1, inputProps:{min:0} })}</Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}><CustomButton text="Cancel" theme={theme} onClick={() => setOpen(false)}/><CustomButton text={editingId ? "Update" : "Save"} variant="contained" theme={theme} variantType="dark" onClick={handleSubmit}/></DialogActions>
    </Dialog>
    <Popup show={popup.show} setShow={(show) => setPopup((p) => ({ ...p, show }))} handleConfirm={popup.okOnly ? undefined : confirmDeactivate} message={popup.message} description={popup.description} okOnly={popup.okOnly}/>
  </>;
}

export default ItemMaster;
