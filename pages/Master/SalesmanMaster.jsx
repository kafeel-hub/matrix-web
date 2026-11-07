import {useSelector} from "react-redux";
import SimpleMasterPage from "../../components/Master/SimpleMasterPage";

export default function SalesmanMaster(){
  const auth=useSelector(s=>s.auth||{});
  const context=auth.context||{};
  // Location authorization/selection is owned by login/context-selection.
  // Reuse that validated state here instead of querying Salesman-specific locations.
  const contextLocations=(auth.companyBranchList||[]).map(x=>({
    value:Number(x.fldID),
    label:`${x.fldID} - ${x.fldDisplay}`
  }));
  if(!contextLocations.length && context.locationId!=null){
    contextLocations.push({value:Number(context.locationId),label:`${context.locationId} - ${context.locationName||context.locationId}`});
  }
  const defaultLocation=context.locationId==null?"":Number(context.locationId);
  const fields=[
    {key:"salesmanId",label:"Salesman ID",required:true},{key:"name",label:"Salesman Name",required:true},{key:"nameArabic",label:"Name (Arabic)"},{key:"prefix",label:"Prefix"},
    {key:"commissionPercent",label:"Commission %",type:"number",number:true,default:0},
    {key:"commissionAccountNo",label:"Salesman Commission A/c",optionsPath:"salesmen/commission-accounts",optionValue:"accountNo",optionLabel:"accountName",optionLabel2:true},
    {key:"locationId",label:"Location",number:true,default:defaultLocation,options:contextLocations},
    {key:"holdStock",label:"Hold Stock",boolean:true,default:false,options:[{value:false,label:"No"},{value:true,label:"Yes"}],display:v=>v?"Yes":"No"},
    {key:"status",label:"Status",number:true,default:0,options:[{value:0,label:"Active"},{value:1,label:"De-Active"}],display:v=>Number(v)===0?"Active":"De-Active"}
  ];
  const toRequest=f=>({...f,locationId:f.locationId===""?null:Number(f.locationId),commissionPercent:Number(f.commissionPercent||0),holdStock:Boolean(f.holdStock),status:Number(f.status||0)});
  return <SimpleMasterPage title="Salesman" path="salesmen" idKey="salesmanId" fields={fields} toRequest={toRequest}/>;
}
