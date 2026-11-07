import React from "react";
import { Grid } from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { ChartCard, KpiCard, SectionTitle } from "./DashboardUi";
import { chartOptions, money, periodLabel, qty } from "./dashboardFormat";

export default function BalancesTab({ dashboard, analytics, groupBy = "month" }) {
  const pos = dashboard?.positions || {};
  const cash = pos.cash || {};
  const bank = pos.bank || {};
  const gold = pos.gold || {};
  const bt = analytics?.balanceTrend || [];
  return <>
    <SectionTitle>CASH & BANK POSITION</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={6} md={2}><KpiCard title="CASH OPENING" value={money(cash.opening)} /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="CASH IN" value={money(cash.debit)} accent="#2ee67d" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="CASH CLOSING" value={money(cash.closing)} accent="#d4af37" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="BANK OPENING" value={money(bank.opening)} /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="BANK IN" value={money(bank.debit)} accent="#3ea6ff" /></Grid>
      <Grid item xs={6} md={2}><KpiCard title="BANK CLOSING" value={money(bank.closing)} accent="#d4af37" /></Grid>
    </Grid>
    <SectionTitle>GOLD POSITION</SectionTitle>
    <Grid container spacing={1.5} mb={2}>
      <Grid item xs={6} md={3}><KpiCard title="GOLD OPENING" value={qty(gold.opening)} unit="grams" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="GOLD IN" value={qty(gold.debit)} unit="grams" accent="#2ee67d" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="GOLD OUT" value={qty(gold.credit)} unit="grams" accent="#ff5c57" /></Grid>
      <Grid item xs={6} md={3}><KpiCard title="GOLD CLOSING" value={qty(gold.closing)} unit="grams" accent="#d4af37" /></Grid>
    </Grid>
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={8}><ChartCard title="Balance Trend"><Line data={{labels:bt.map(x=>periodLabel(x.period, groupBy)),datasets:[{label:"Cash",data:bt.map(x=>x.cashClosing),borderColor:"#d4af37",backgroundColor:"#d4af37",tension:.2},{label:"Bank",data:bt.map(x=>x.bankClosing),borderColor:"#3ea6ff",backgroundColor:"#3ea6ff",tension:.2}]}} options={chartOptions()} /></ChartCard></Grid>
      <Grid item xs={12} md={4}><ChartCard title="Gold Movement (grams)"><Bar data={{labels:["Opening","In","Out","Closing"],datasets:[{label:"grams",data:[gold.opening,gold.debit,gold.credit,gold.closing],backgroundColor:["#9ea3d1","#2ee67d","#ff5c57","#d4af37"],borderRadius:5}]}} options={chartOptions("", "grams")} /></ChartCard></Grid>
    </Grid>
  </>;
}
