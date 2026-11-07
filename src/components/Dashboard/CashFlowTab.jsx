import React from "react";
import { Grid } from "@mui/material";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard, EmptyChart, KpiCard, SectionTitle } from "./DashboardUi";
import { chartOptions, hasNonZero, money, periodLabel } from "./dashboardFormat";

export default function CashFlowTab({ dashboard, analytics, groupBy = "month" }) {
  const cf = analytics?.cashFlow || {};
  const mix = analytics?.paymentMix || [];
  const ss = dashboard?.salesSummary || {};
  const r = dashboard?.receipts || {};
  const o = dashboard?.outflows || {};
  const bt = analytics?.balanceTrend || [];
  return <>
    <SectionTitle>CASH FLOW</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={6} md={2}><KpiCard title="CARD / K-NET SALES" value={money(ss.kNet)} /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="CREDIT SALES" value={money(ss.credit)} accent="#3ea6ff" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="CASH RECEIVED" value={money(r.cashReceived)} accent="#2ee67d" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="K-NET RECEIVED" value={money(r.kNetReceived)} accent="#b26cff" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="TOTAL MONEY IN" value={money(cf.totalMoneyIn)} accent="#2ee67d" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="TOTAL MONEY OUT" value={money(cf.totalMoneyOut)} accent="#ff5c57" /></Grid>
    </Grid>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={12} md={5}><ChartCard title="Payment Methods Mix">{hasNonZero(mix.map(x=>x.amount)) ? <Doughnut data={{labels:mix.map(x=>x.paymentName || x.paymentId),datasets:[{data:mix.map(x=>x.amount),backgroundColor:["#d4af37","#3ea6ff","#2ee67d","#b26cff","#ff8c5a"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{color:"#9ea3d1"}}}}}/> : <EmptyChart message="No payment methods for the selected period" />}</ChartCard></Grid>
      <Grid item xs={12} md={7}><ChartCard title="Operational Outflows">{hasNonZero([o.cashPurchase,o.payments,o.kNetPayments,o.expenses]) ? <Bar data={{labels:["Cash Purchase","Payments","K-Net Payments","Expenses"],datasets:[{label:"KWD",data:[o.cashPurchase,o.payments,o.kNetPayments,o.expenses],backgroundColor:["#d4af37","#3ea6ff","#b26cff","#ff5c57"],borderRadius:5}]}} options={chartOptions("", "KWD")} /> : <EmptyChart message="No operational outflows for the selected period" />}</ChartCard></Grid>
    </Grid>
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={8}><ChartCard title="Cash & Bank Closing Balance Trend"><Line data={{labels:bt.map(x=>periodLabel(x.period, groupBy)),datasets:[{label:"Cash",data:bt.map(x=>x.cashClosing),borderColor:"#d4af37",backgroundColor:"#d4af37",tension:.2},{label:"Bank",data:bt.map(x=>x.bankClosing),borderColor:"#3ea6ff",backgroundColor:"#3ea6ff",tension:.2}]}} options={chartOptions()} /></ChartCard></Grid>
      <Grid item xs={12} md={4}><ChartCard title="Ledger Money Movement"><Bar data={{labels:["Cash In","Cash Out","Bank In","Bank Out"],datasets:[{label:"KWD",data:[cf.cashIn,cf.cashOut,cf.bankIn,cf.bankOut],backgroundColor:["#2ee67d","#ff5c57","#3ea6ff","#b26cff"],borderRadius:5}]}} options={chartOptions()} /></ChartCard></Grid>
    </Grid>
  </>;
}
