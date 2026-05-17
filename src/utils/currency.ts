/**
 * Format amount in Indian Rupees
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format amount in lakhs
 */
export function formatLakhs(amount: number): string {
  const lakhs = amount / 100000;
  if (lakhs >= 1) {
    return `₹${lakhs.toFixed(2)}L`;
  }
  return formatINR(amount);
}

/**
 * Format amount in crores and lakhs
 */
export function formatCroresLakhs(amount: number): string {
  const crores = Math.floor(amount / 10000000);
  const lakhs = Math.floor((amount % 10000000) / 100000);
  
  if (crores > 0) {
    if (lakhs > 0) {
      return `₹${crores}Cr ${lakhs}L`;
    }
    return `₹${crores}Cr`;
  } else if (lakhs > 0) {
    return `₹${lakhs}L`;
  }
  
  return formatINR(amount);
}

/**
 * Get compact Indian number format
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return formatINR(amount);
}
