const USD_TO_ETB_RATE = 80;

export const convertUsdToEtb = (usdAmount) => {
  return usdAmount * USD_TO_ETB_RATE;
};

export const formatCurrency = (amount) => {
  return `${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} birr`;
};

export const formatCurrencyFromUsd = (usdAmount) => {
  const etbAmount = convertUsdToEtb(usdAmount);
  return formatCurrency(etbAmount);
};