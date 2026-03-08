/** Country/locale codes: geo (Georgia), aze (Azerbaijan), arm (Armenia). */
export type Lang = 'geo' | 'aze' | 'arm';

function normalizeLangOverride(value: string | null): Lang | null {
  switch (value) {
    case 'geo':
    case 'ge':
      return 'geo';
    case 'aze':
    case 'az':
      return 'aze';
    case 'arm':
    case 'am':
      return 'arm';
    default:
      return null;
  }
}

/**
 * Derives language from domain: kitkat.ge → geo, kitkat.am → arm, kitkat.az → aze.
 * On localhost/unknown hosts, ?lang= is required (no default).
 */
export function getLangFromDomain(): Lang {
  if (typeof window === 'undefined') return 'geo';
  const params = new URLSearchParams(window.location.search);
  const override = normalizeLangOverride(params.get('lang')?.toLowerCase() ?? null);
  if (override) return override;
  const host = window.location.hostname.toLowerCase();
  if (host.endsWith('.am')) return 'arm';
  if (host.endsWith('.az')) return 'aze';
  if (host.endsWith('.ge')) return 'geo';
  // localhost/unknown: require explicit ?lang=, redirect to add it if missing
  if (host === 'localhost' || host === '127.0.0.1') {
    params.set('lang', 'geo');
    const qs = params.toString();
    window.location.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }
  return 'geo';
}
