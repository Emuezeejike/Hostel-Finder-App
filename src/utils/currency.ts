export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceWithPeriod(value: number, period: string = 'year') {
  return `${formatCurrency(value)} / ${period}`;
}
