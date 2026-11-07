import SimpleMasterPage from "../../components/Master/SimpleMasterPage";
export default function AreaMaster(){const fields=[
{key:"areaId",label:"Area ID",required:true},
{key:"name",label:"Area Name",required:true},
{key:"nameArabic",label:"Name (Arabic)"},
{key:"prefix",label:"Prefix"},
{key:"countryId",label:"Country",optionsPath:"countries",optionValue:"countryId",optionLabel:"name"}
];return <SimpleMasterPage title="Area" path="areas" idKey="areaId" fields={fields}/>;}
