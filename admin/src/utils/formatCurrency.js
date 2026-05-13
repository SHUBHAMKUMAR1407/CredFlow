export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};
export const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);
