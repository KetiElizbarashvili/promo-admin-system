import { useEffect, useState } from 'react';
import { getLangFromDomain, type Lang } from '../utils/locale';
import '../countdown-responsive.css';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const TARGET_DATE = new Date('2026-04-01T00:01:00');

const TEXTS: Record<Lang, { tagline: string; subtitle: string; units: [string, string, string, string] }> = {
  geo: {
    tagline: 'ყურადღებაა! მოემზადეეეეთ.... შესვენება!',
    subtitle: 'ამაღელვებელი სიახლე გველის',
    units: ['დღ', 'სტ', 'წთ', 'წმ'],
  },
  aze: {
    tagline: 'Həyəcan yüksəlir… artıq çox az qalıb, tezliklə başlayırıq!',
    subtitle: '',
    units: ['Gün', 'Saat', 'Dəq.', 'San.'],
  },
  arm: {
    tagline: 'Պատրա՞ստ ես․․․ Հետհաշվարկը սկսված է',
    subtitle: '',
    units: ['Օր', 'Ժամ', 'Րոպե', 'Վրկ'],
  },
};
// ─────────────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface CountdownPageProps {
  /** When set (e.g. in standalone builds), overrides domain-based detection. */
  fixedLang?: Lang;
}

export function CountdownPage({ fixedLang }: CountdownPageProps = {}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);
  const lang = fixedLang ?? getLangFromDomain();

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = TEXTS[lang];
  const units: Array<{ value: number; label: string }> = [
    { value: timeLeft.days, label: t.units[0] },
    { value: timeLeft.hours, label: t.units[1] },
    { value: timeLeft.minutes, label: t.units[2] },
    { value: timeLeft.seconds, label: t.units[3] },
  ];

  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  const BANNERS: Record<Lang, string> = {
    arm: `${base}countdown-banner-am.png`,
    aze: `${base}countdown-banner-az.png`,
    geo: `${base}countdown-banner-ge.png`,
  };

  return (
    <div className="countdown-page" style={styles.root}>
      {/* ── BANNER (logos + text) ── */}
      <img src={BANNERS[lang]} alt="KitKat Formula 1" className="countdown-banner" style={styles.banner} />

      {/* ── TAGLINE & SUBTITLE ── */}
      <p className="countdown-tagline" style={styles.tagline}>{t.tagline}</p>
      {t.subtitle && <p className="countdown-subtitle" style={styles.subtitle}>{t.subtitle}</p>}

      {/* ── COUNTDOWN PILL ── */}
      <div className="countdown-pill" style={styles.pill}>
        {units.map(({ value, label }, i) => (
          <span key={label} className="countdown-unit-group" style={styles.unitGroup}>
            <span className="countdown-number" style={styles.number}>{pad(value)}</span>
            <span className="countdown-label" style={styles.label}>{label}</span>
            {i < units.length - 1 && <span className="countdown-sep" style={styles.sep} />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const RED = '#CC0000';

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: RED,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px 16px',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
    fontFamily: "'Formula1Display', 'Helvetica Neue', Arial, sans-serif",
    color: '#fff',
    textAlign: 'center',
  },

  banner: {
    maxWidth: '100%',
    width: 'min(970px, 95vw)',
    height: 'auto',
    objectFit: 'contain' as const,
    marginBottom: '16px',
  },
  tagline: {
    fontSize: '14px',
    fontWeight: 400,
    margin: '0 0 4px',
    opacity: 0.95,
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 400,
    margin: '0 0 8px',
    opacity: 0.95,
  },

  // Countdown
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap' as const,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '8px 20px',
    gap: '0px',
    width: '100%',
    maxWidth: '320px',
    minWidth: 0,
    boxSizing: 'border-box' as const,
  },
  unitGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
  },
  number: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '1px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#111',
  },
  sep: {
    display: 'inline-block',
    width: '24px',
  },
};
