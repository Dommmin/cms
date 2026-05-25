export function formatMoney(cents: number, currency = 'PLN', locale = 'pl-PL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function stripHtml(value: string | null | undefined): string {
  return value?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? '';
}
