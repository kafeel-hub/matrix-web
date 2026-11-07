import React from "react";
import { Grid } from "@mui/material";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from "chart.js";
import { ChartCard, EmptyChart, KpiCard, SectionTitle } from "./DashboardUi";
import { chartOptions, hasNonZero, money, pct, periodLabel, qty } from "./dashboardFormat";
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function OverviewTab({ analytics, groupBy = "month" }) {
  const k = analytics?.kpis || {};
  const mc = analytics?.makingCharge || {};
  const p = analytics?.profitability || analytics?.managementProfitability || {};
  const trend = analytics?.salesTrend || [];
  const composition = analytics?.salesComposition || [];
  const paymentMix = analytics?.paymentMix || [];
  return <>
    <SectionTitle>EXECUTIVE SUMMARY</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={6} md={2}><KpiCard title="GROSS SALES" value={money(k.grossSales)} /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="NET SALES" value={money(k.netSales)} accent="#2ee67d" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="SALES WEIGHT" value={qty(k.salesWeight)} unit="grams" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="SALES QTY" value={qty(k.salesQuantity,0)} unit="items" accent="#3ea6ff" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="DISCOUNT" value={money(k.discount)} accent="#ff8c5a" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="MGMT. NET PROFIT" value={money(p.netProfit)} sub={p.marginPercentage != null ? `Margin ${pct(p.marginPercentage)}` : ""} accent="#b26cff" valueColor="#2ee67d" /></Grid>
    </Grid>

    <SectionTitle>SALES PERFORMANCE</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={12} md={4}><KpiCard title="MAKING CHARGE SALES" value={money(mc.sales)} /></Grid>
      <Grid item xs={12} md={4}><KpiCard title="MAKING CHARGE COST" value={money(mc.cost)} accent="#3ea6ff" /></Grid>
      <Grid item xs={12} md={4}><KpiCard title="MAKING CHARGE PROFIT" value={money(mc.profit)} sub={`MC margin ${pct(mc.marginPercentage)}`} accent="#2ee67d" /></Grid>
    </Grid>

    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={12} md={8}><ChartCard title="Sales Trend"><Line data={{labels:trend.map(x=>periodLabel(x.period, groupBy)),datasets:[{label:"Gross Sales",data:trend.map(x=>x.grossSales),borderColor:"#d4af37",backgroundColor:"#d4af37",tension:.25},{label:"Net Sales",data:trend.map(x=>x.netSales),borderColor:"#2ee67d",backgroundColor:"#2ee67d",tension:.25}]}} options={chartOptions()} /></ChartCard></Grid>
      <Grid item xs={12} md={4}><ChartCard title="Sales Composition">{hasNonZero(composition.map(x=>x.amount)) ? <Doughnut data={{labels:composition.map(x=>`${x.code || x.transactionType || "Sales"}${x.purity ? ` · ${x.purity} purity`:""}`),datasets:[{data:composition.map(x=>x.amount),backgroundColor:["#d4af37","#3ea6ff","#b26cff","#2ee67d","#ff8c5a"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"#9ea3d1",font:{size:9}}}}}} /> : <EmptyChart message="No sales composition for the selected period" />}</ChartCard></Grid>
    </Grid>
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={6}><ChartCard title="Payment Mix">{hasNonZero(paymentMix.map(x=>x.amount)) ? <Doughnut data={{labels:paymentMix.map(x=>x.paymentName || x.paymentId),datasets:[{data:paymentMix.map(x=>x.amount),backgroundColor:["#d4af37","#3ea6ff","#2ee67d","#b26cff","#ff8c5a"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"#9ea3d1"}}}}} /> : <EmptyChart message="No payments for the selected period" />}</ChartCard></Grid>
      <Grid item xs={12} md={6}><ChartCard title="Management Profitability"><Bar data={{labels:["MC Profit","Scrap Profit","Expenses","Net Profit"],datasets:[{label:"KWD",data:[p.makingChargeProfit,p.scrapProfit,p.expenses,p.netProfit],backgroundColor:["#d4af37","#3ea6ff","#ff5c57","#2ee67d"],borderRadius:5}]}} options={chartOptions()} /></ChartCard></Grid>
    </Grid>
  </>;
}
