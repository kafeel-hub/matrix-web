import SimpleMasterPage from "../../components/Master/SimpleMasterPage";
export default function GoldPurityMaster(){const fields=[
{key:"purityNo",label:"Purity",required:true,type:"number",number:true},{key:"description",label:"Description",required:true},{key:"descriptionArabic",label:"Description (Arabic)"},{key:"deductionPercent",label:"Deduction %",type:"number",number:true,default:0},
{key:"status",label:"Status",number:true,default:0,options:[{value:0,label:"Active"},{value:1,label:"De-Active"}],display:v=>Number(v)===0?"Active":"De-Active"}
];return <SimpleMasterPage title="Gold Purity" path="gold-purities" idKey="purityNo" fields={fields} allowDeactivate/>;}