export function formatCurrency(value, options = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 4,
    ...options
  }).format(Number(value || 0));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatPercent(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

export function formatDate(dateValue, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(new Date(dateValue));
}

export function formatChartDate(timestamp, days) {
  const date = new Date(timestamp);

  if (days <= 1) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  if (days >= 365) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short"
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}
