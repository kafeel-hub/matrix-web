export const convertNaNtoZero = (value) =>
  isNaN(value) || value === null || value === undefined ? 0 : value;

export const calculateGoldRetailPricePerGm = ({
  grossWgt,
  stoneWgt,
  goldPrice,
  stoneAmount,
  mcgm,
  digits = 2,
  itemType,
  qty,
}) => {
  const netWeight = parseFloat(grossWgt) - parseFloat(stoneWgt);
  const Amount =
    itemType !== "perPiece"
      ? netWeight * parseFloat(goldPrice) +
        parseFloat(mcgm) * parseFloat(grossWgt) +
        parseFloat(stoneAmount)
      : netWeight * parseFloat(goldPrice) +
        parseFloat(mcgm) +
        parseFloat(stoneAmount);
  const pricePerGm =
    itemType !== "perPiece"
      ? parseFloat(Amount) / parseFloat(grossWgt)
      : parseFloat(Amount);
  return parseFloat(convertNaNtoZero(pricePerGm)).toFixed(digits);
};

export const calculateMCGM = ({
  total,
  grossWgt,
  stoneWgt,
  goldPrice,
  stoneAmount,
}) => {
  const netwgt = parseFloat(grossWgt) - parseFloat(stoneWgt);

  const mcgm =
    (parseFloat(total) -
      (parseFloat(netwgt) * parseFloat(goldPrice) + parseFloat(stoneAmount))) /
    parseFloat(netwgt);
  return convertNaNtoZero(mcgm);
};

export const calculateGoldRetailPrice = ({
  grossWgt,
  stoneWgt,
  goldPrice,
  stoneAmount,
  mcgm,
  itemType,
  qty,
  digits = 2,
}) => {
  console.log(itemType, "itemTyoe");
  const netWeight =
    // itemType !== "perPiece"
    parseFloat(grossWgt) - parseFloat(stoneWgt);
  // : parseFloat(stoneWgt);
  const amount =
    itemType !== "perPiece"
      ? netWeight * parseFloat(goldPrice) +
        parseFloat(mcgm) * parseFloat(grossWgt) +
        parseFloat(stoneAmount)
      : netWeight * parseFloat(goldPrice) +
        parseFloat(mcgm) +
        parseFloat(stoneAmount);
  return parseFloat(convertNaNtoZero(amount)).toFixed(digits);
};

// export const calculateGoldRetailAmount = ({
//   price,
//   qty,
//   netWt,
//   digits = 2,
// }) => {
//   console.log(price, qty, "price calculation");
//   const amount =
//     parseFloat(price) * parseFloat(qty || 1);
//   console.log(amount, "amount calculation");

//   return parseFloat(convertNaNtoZero(amount)).toFixed(digits);
// };

export const calculateGoldRetaildedAmount = ({
  price,
  qty,
  grossWt,
  deductionWt,
  digits = 2,
}) => {
  console.log(price, qty, grossWt, deductionWt, "price calculation");

  const parsedPrice = parseFloat(price || 0);
  const parsedQty = parseFloat(qty || 1);
  const parsedGrossWt = parseFloat(grossWt || 0);
  const parsedDeductionWt = parseFloat(deductionWt || 0);

  if (!deductionWt && !grossWt) {
  }
  const totalAmount = parsedPrice * parsedQty * parsedGrossWt;

  // Calculate amount per unit weight
  const amountPerWeight = parsedGrossWt > 0 ? totalAmount / parsedGrossWt : 0;

  // Deduct amount based on deduction weight
  const deductedAmount = parsedDeductionWt * amountPerWeight;
  console.log(deductedAmount, parsedDeductionWt, deductionWt, "deduction info");
  // Final amount after deduction
  const amount = totalAmount - deductedAmount;

  console.log(totalAmount, "Total Amount before deduction");
  console.log(amountPerWeight, "Amount per weight");
  console.log(deductedAmount, "Deducted Amount");
  console.log(amount, "Final Amount after deduction");
  // const amount = parseFloat(price) * parseFloat(qty);

  return amount.toFixed(digits);
};
export const calculateGoldRetailAmount = ({ price, qty, digits = 2 }) => {
  console.log("retail amount trigger", price, qty);
  const amount = parseFloat(price) * parseFloat(qty);
  return parseFloat(convertNaNtoZero(amount)).toFixed(digits);
};
export const calculatePureWeight = ({ netWt, purity, digits }) => {
  const pureWeight = (parseFloat(netWt) * parseFloat(purity)) / 999;
  return parseFloat(convertNaNtoZero(pureWeight)).toFixed(digits);
};

export const calculateGoldSalePerGram = ({ price, digits = 2 }) => {
  const amount = parseFloat(price);
  return parseFloat(convertNaNtoZero(amount)).toFixed(digits);
};
export const calculateGoldSalePerPcs = ({
  price,
  qty,
  stoneAmount,
  digits = 2,
}) => {
  console.log("saleperpcs amount trigger", price, qty);
  const amount = parseFloat(price) * parseFloat(qty);
  return parseFloat(convertNaNtoZero(amount)).toFixed(digits);
};

export const calculateGoldRetailPerGram = ({
  netWt,
  mcgm,
  stoneAmount,
  digits = 2,
}) => {
  const parsedNetWt = Number(netWt) || 0;
  const parsedMcgm = Number(mcgm) || 0;
  const parsedStoneAmount = Number(stoneAmount) || 0;

  const amount = parsedMcgm * parsedNetWt + parsedStoneAmount;
  return Number(convertNaNtoZero(amount)).toFixed(digits);
};
export const calculateGoldRetailPerPcs = ({
  qty,
  mcgm,
  stoneAmount,
  digits = 2,
}) => {
  const parsedqty = Number(qty) || 0;
  const parsedMcgm = Number(mcgm) || 0;
  const parsedStoneAmount = Number(stoneAmount) || 0;
  console.log("Retailperpcs amount trigger", mcgm, stoneAmount);
  const amount = parsedMcgm * parsedqty + parsedStoneAmount;
  return Number(convertNaNtoZero(amount)).toFixed(digits);
};
