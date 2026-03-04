import { useEffect, useState } from 'react';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const TARGET_DATE = new Date('2026-03-04T00:00:00');

type Lang = 'geo' | 'aze' | 'arm';

const TEXTS: Record<Lang, { tagline: string; subtitle: string; units: [string, string, string, string] }> = {
  geo: {
    tagline: 'ყურადღებაა! მოემზადეეეეთ.... შესვენება!',
    subtitle: 'ამაღელვებელი სიახლე გველის',
    units: ['დ', 'ს', 'წთ', 'წ'],
  },
  aze: {
    tagline: 'Həyəcan yüksəlir… artıq çox az qalıb, tezliklə başlayırıq!',
    subtitle: '',
    units: ['G', 'S', 'D', 'Sn'],
  },
  arm: {
    tagline: 'Պատրա՞ստ ես․․․ Հետհաշվարկը սկսված է',
    subtitle: '',
    units: ['օ', 'ժ', 'ր', 'վ'],
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

export function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);
  const [lang, setLang] = useState<Lang>('geo');

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

  return (
    <div style={styles.root}>
      {/* ── LOGOS ── */}
      <div style={styles.logoRow}>
        <img src="/formula.png" alt="Formula 1" style={styles.logoF1} />
        <div style={styles.divider} />
        <img src="/kitkat.png" alt="KitKat" style={styles.logoKitkat} />
      </div>

      {/* ── PARTNER LINE ── */}
      <p style={styles.partner}>Official Partner of Formula 1®</p>

      {/* ── LANGUAGE SELECTOR ── */}
      <div style={styles.langRow}>
        {(['geo', 'aze', 'arm'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{ ...styles.langBtn, ...(lang === l ? styles.langBtnActive : {}) }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── TAGLINE ── */}
      <p style={styles.tagline}>{t.tagline}</p>

      {/* ── SUBTITLE ── */}
      {t.subtitle && <p style={styles.subtitle}>{t.subtitle}</p>}

      {/* ── COUNTDOWN PILL ── */}
      <div style={styles.pill}>
        {units.map(({ value, label }, i) => (
          <span key={label} style={styles.unitGroup}>
            <span style={styles.number}>{pad(value)}</span>
            <span style={styles.label}>{label}</span>
            {i < units.length - 1 && <span style={styles.sep} />}
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
    minHeight: '100vh',
    backgroundColor: RED,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 24px',
    fontFamily: "'Formula1Display', 'Helvetica Neue', Arial, sans-serif",
    color: '#fff',
    textAlign: 'center',
  },

  // Logos
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    marginBottom: '8px',
  },
  logoF1: {
    height: '56px',
    width: 'auto',
    objectFit: 'contain' as const,
  },
  logoKitkat: {
    height: '52px',
    width: 'auto',
    objectFit: 'contain' as const,
  },
  divider: {
    width: '1px',
    height: '52px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // Language selector
  langRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  langBtn: {
    padding: '6px 14px',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '4px',
    background: 'transparent',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  langBtnActive: {
    background: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },

  // Text
  partner: {
    fontSize: '15px',
    fontWeight: 400,
    margin: '0 0 16px',
    letterSpacing: '0.3px',
  },
  tagline: {
    fontSize: '14px',
    fontWeight: 400,
    margin: '0',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 400,
    margin: '0 0 4px',
    opacity: 0.9,
  },

  // Countdown
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '10px 40px',
    gap: '0px',
    minWidth: '320px',
  },
  unitGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
  },
  number: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '1px',
  },
  label: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111',
  },
  sep: {
    display: 'inline-block',
    width: '32px',
  },
};
