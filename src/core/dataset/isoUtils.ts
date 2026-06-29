/** Convert UPI-style ISO (INRJ) to Natural Earth admin-1 (IN-RJ). */
export function upiIsoToNaturalEarth(iso: string): string {
  const normalized = iso.trim().toUpperCase()
  if (normalized.includes('-')) return normalized
  if (normalized.length >= 4 && normalized.startsWith('IN')) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2)}`
  }
  return normalized
}

/** Convert Natural Earth ISO (IN-RJ) to compact UPI form (INRJ). */
export function naturalEarthToUpiIso(iso: string): string {
  return iso.replace('-', '')
}
