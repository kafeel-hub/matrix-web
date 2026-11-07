import SimpleMasterPage from "../../components/Master/SimpleMasterPage";
export default function ItemSubcategoryMaster(){const fields=[
{key:"subcategoryId",label:"Subcategory ID",required:true},{key:"name",label:"Subcategory Name",required:true},{key:"nameArabic",label:"Name (Arabic)"},
{key:"categoryId",label:"Item Category",required:true,optionsPath:"item-categories",optionValue:"categoryId",optionLabel:"name"},{key:"prefix",label:"Prefix"},
{key:"status",label:"Status",number:true,default:0,options:[{value:0,label:"Active"},{value:1,label:"De-Active"}],display:v=>Number(v)===0?"Active":"De-Active"}
];return <SimpleMasterPage title="Item Subcategory" path="item-subcategories" idKey="subcategoryId" fields={fields} allowDeactivate/>;}