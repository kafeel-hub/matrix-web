import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export const SectionTitle = ({ children }) => <Box sx={{display:"flex",alignItems:"center",gap:1.5,mb:1.5,mt:.5}}><Typography sx={{color:"#f0c33c",fontWeight:800,fontSize:12,letterSpacing:1.2,whiteSpace:"nowrap"}}>{children}</Typography><Box sx={{flex:1,height:"1px",background:"linear-gradient(90deg,#2b2e52,rgba(43,46,82,.08))"}} /></Box>;

export const KpiCard = ({ title, value, unit="KWD", sub, accent="#d4af37", valueColor="#fff" }) => <Paper sx={{background:"#171936",borderRadius:2,border:"1px solid #2b2e52",borderTop:`3px solid ${accent}`,p:1.5,minHeight:78}}><Typography sx={{color:"#9ea3d1",fontSize:9,letterSpacing:.5}}>{title}</Typography><Typography sx={{color:valueColor,fontWeight:800,fontSize:18,mt:.8,lineHeight:1}}>{value}</Typography><Typography sx={{color:"#8d93bd",fontSize:9,mt:.7}}>{unit}{sub ? ` · ${sub}` : ""}</Typography></Paper>;

export const ChartCard = ({ title, children, height=245 }) => <Paper sx={{background:"#171936",borderRadius:2,border:"1px solid #2b2e52",p:1.5,height}}><Typography sx={{color:"#f0c33c",fontSize:11,fontWeight:700,mb:1}}>{title}</Typography><Box sx={{height:height-48}}>{children}</Box></Paper>;

export const EmptyChart = ({ message="No activity for the selected period" }) => <Box sx={{height:"100%",display:"grid",placeItems:"center",textAlign:"center",px:2}}><Box><Typography sx={{color:"#9ea3d1",fontSize:12,fontWeight:600}}>No activity</Typography><Typography sx={{color:"#676d98",fontSize:10,mt:.5}}>{message}</Typography></Box></Box>;
