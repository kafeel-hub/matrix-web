export const formatPaymentDetails = (data, comboBox) => {
  if (!Array.isArray(data)) return { paymentDetails: [] };
  return {
    paymentDetails: data.map((item) => {
      const payTypeObject = comboBox?.paytype?.find(
        (it) => parseInt(it.fldID, 10) === parseInt(item.PayCurId, 10)
      );
      return {
        payType: {
          label: payTypeObject?.fldDisplay || "Unknown",
          value: item?.PayCurId || "00",
        },
        amount: item?.PayAmt || 0,
      };
    }),
  };
};

// export const formatProductDetails = (data, type) => {
//   debugger;
//   if (!Array.isArray(data)) return [];
//   return data.map((item) => ({
//     id: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
//     itemCode: {
//       label: item?.ProdNameInv || "Unknown",
//       value: item?.ProdId || "Unknown",
//     },

//     description: item?.ProdNameInv || "Unknown",
//     purity: item?.ProdGoldPurity || 0,
//     qty: item?.ProdQty || 1,
//     grossWt: item?.ProdGoldWgt || 0,
//     stoneWt: item?.ProdStoneWgt || 0,
//     netWt: item?.ProdGoldNetWgt || 0,
//     goldPrice: item?.ProdRate || 0,
//     mcPerGm: (item?.ProdMcRate || 0).toString(),
//     unitPricePerGm: (item?.ProdMcCost || 0).toFixed(3),
//     stoneAmount: item?.ProdStoneAmount || 0,
//     price: (item?.ProdAmount || 0).toFixed(3),
//     amount: (item?.ProdAmount || 0).toFixed(3),

//     description: item.ProdNameInv || "",
//     purity: item.ProdGoldPurity || "",
//     qty: parseFloat(item.ProdQty) || 1,
//     grossWt: parseFloat(item.ProdGoldWgt) || 0,
//     netWt: item?.ProdGoldNetWgt || 0,
//     amount: (item?.ProdAmount || 0).toFixed(3),

//     deductionWt: parseFloat(item.ProdDedWgt) || 0,
//     deductionPrcnt: parseFloat(item.ProdDedPer) || 0,
//     goldPrice: parseFloat(item.ProdGoldRate) || 10,
//     pureWeight: item.ProdGoldPureWgt,
//     mcType: item.ProdMcTypeId,

//     // ProdTranTypeId: "0",
//   }));
// };
export const formatProductDetails = (data, type) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    if (type === "SCRAP") {
      return {
        id: item?.ProdId || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        itemCode: {
          label: item?.ProdNameInv || "Unknown",
          value: item?.ProdId || "Unknown",
        },
        description: item.ProdNameInv || "",
        purity: item.ProdGoldPurity || "",
        qty: parseFloat(item.ProdQty) || 1,
        grossWt: parseFloat(item.ProdGoldWgt) || 0,
        netWt: item?.ProdGoldNetWgt || 0,
        amount: (item?.ProdAmount || 0).toFixed(3),
        deductionWt: parseFloat(item.ProdDedWgt) || 0,
        deductionPrcnt: parseFloat(item.ProdDedPer) || 0,
        goldPrice: parseFloat(item.ProdGoldRate) || 10,
        pureWeight: item.ProdGoldPureWgt || 0,
        mcType: item.ProdMcTypeId || "",
      };
    }

    return {
      id: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      itemCode: {
        label: item?.ProdNameInv || "Unknown",
        value: item?.ProdId || "Unknown",
      },
      description: item?.ProdNameInv || "Unknown",
      purity: item?.ProdGoldPurity || 0,
      qty: item?.ProdQty || 1,
      grossWt: item?.ProdGoldWgt || 0,
      stoneWt: item?.ProdStoneWgt || 0,
      netWt: item?.ProdGoldNetWgt || 0,
      goldPrice: item?.ProdRate || 0,
      mcPerGm: (item?.ProdMcRate || 0).toString(),
      unitPricePerGm: (item?.ProdMcCost || 0).toFixed(3),
      stoneAmount: item?.ProdStoneAmount || 0,
      price: (item?.ProdAmount || 0).toFixed(3),
      amount: (item?.ProdAmount || 0).toFixed(3),
    };
  });
};
