import React from "react";
import { Grid } from "@mui/material";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard, EmptyChart, KpiCard, SectionTitle } from "./DashboardUi";
import { chartOptions, hasNonZero, money, periodLabel, qty } from "./dashboardFormat";

export default function GoldScrapTab({ dashboard, analytics, groupBy = "month" }) {
  const scrap = dashboard?.scrapPurchase || {};
  const gp = dashboard?.goldPurchases || {};
  const purchases = analytics?.purchases || {};
  const mix = purchases.mix || [];
  const trend = purchases.trend || [];
  const weightParts = [
    {name:"Scrap Pure",value:scrap.pureWeight || 0},
    {name:"Fixed",value:gp.fixedWeight || 0},
    {name:"Fixing",value:gp.fixingWeight || 0},
  ];
  const amountParts = [
    {name:"Scrap",value:scrap.value || 0},
    {name:"Fixed",value:gp.fixedAmount || 0},
    {name:"Fixing",value:gp.fixingAmount || 0},
  ];
  return <>
    <SectionTitle>GOLD & SCRAP PURCHASES</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={6} md={3}><KpiCard title="TOTAL PURCHASE WT." value={qty(purchases.totalWeight)} unit="grams" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="TOTAL PURCHASE AMT." value={money(purchases.totalAmount)} accent="#3ea6ff" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="SCRAP PURE WT." value={qty(scrap.pureWeight)} unit="grams" accent="#b26cff" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="SCRAP PROFIT" value={money(scrap.profit)} accent="#2ee67d" /></Grid>
    </Grid>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={12} md={6}><ChartCard title="Purchase Weight Mix (grams)">{hasNonZero(weightParts.map(x=>x.value)) ? <Doughnut data={{labels:weightParts.map(x=>x.name),datasets:[{data:weightParts.map(x=>x.value),backgroundColor:["#d4af37","#3ea6ff","#b26cff"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"#9ea3d1"}}}}}/> : <EmptyChart message="No gold or scrap purchase weight for the selected period" />}</ChartCard></Grid>
      <Grid item xs={12} md={6}><ChartCard title="Purchase Amount Mix (KWD)">{hasNonZero(amountParts.map(x=>x.value)) ? <Doughnut data={{labels:amountParts.map(x=>x.name),datasets:[{data:amountParts.map(x=>x.value),backgroundColor:["#d4af37","#3ea6ff","#b26cff"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"#9ea3d1"}}}}}/> : <EmptyChart message="No gold or scrap purchase amount for the selected period" />}</ChartCard></Grid>
    </Grid>
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={8}><ChartCard title="Purchase Trend">{hasNonZero(trend.map(x=>x.amount || x.totalAmount || 0)) ? <Line data={{labels:trend.map(x=>periodLabel(x.period, groupBy)),datasets:[{label:"Amount",data:trend.map(x=>x.amount || x.totalAmount || 0),borderColor:"#d4af37",backgroundColor:"#d4af37",tension:.25}]}} options={chartOptions("", "KWD")} /> : <EmptyChart message="No purchase activity for the selected period" />}</ChartCard></Grid>
      <Grid item xs={12} md={4}><ChartCard title="Purchase Classification">{hasNonZero(mix.map(x=>x.amount)) ? <Bar data={{labels:mix.map(x=>x.code || x.name || x.type),datasets:[{label:"Amount",data:mix.map(x=>x.amount),backgroundColor:"#d4af37",borderRadius:5}]}} options={chartOptions("", "KWD")} /> : <EmptyChart message="No purchase classification for the selected period" />}</ChartCard></Grid>
    </Grid>
  </>;
}
