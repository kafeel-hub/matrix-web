import SimpleMasterPage from "../../components/Master/SimpleMasterPage";
export default function ItemDesignMaster(){const fields=[
{key:"designId",label:"Design ID",required:true},{key:"name",label:"Design Name",required:true},{key:"nameArabic",label:"Name (Arabic)"},{key:"prefix",label:"Prefix"},
{key:"status",label:"Status",number:true,default:0,options:[{value:0,label:"Active"},{value:1,label:"De-Active"}],display:v=>Number(v)===0?"Active":"De-Active"}
];return <SimpleMasterPage title="Item Design" path="item-designs" idKey="designId" fields={fields} allowDeactivate/>;}