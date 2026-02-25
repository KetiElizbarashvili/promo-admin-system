import { useEffect, useState } from 'react';

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Set your raffle target date here (ISO 8601)
const TARGET_DATE = new Date('2026-03-04T00:00:00');

// Texts – edit as needed
const TAGLINE = 'Готови! На старта...Почивка!';
const SUBTITLE = 'Нещо вълнуващо наближава след:';
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

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: Array<{ value: number; label: string }> = [
    { value: timeLeft.days,    label: 'Д' },
    { value: timeLeft.hours,   label: 'Ч' },
    { value: timeLeft.minutes, label: 'М' },
    { value: timeLeft.seconds, label: 'С' },
  ];

  return (
    <div style={styles.root}>
      {/* ── LOGOS ── add your actual logo images here */}
      <div style={styles.logoRow}>
        {/* Replace these placeholders with <img> tags once you have the assets */}
        <div style={styles.logoPlaceholder}>F1 Logo</div>
        <div style={styles.divider} />
        <div style={styles.logoPlaceholder}>KitKat Logo</div>
      </div>

      {/* ── PARTNER LINE ── */}
      <p style={styles.partner}>Official Partner of Formula 1®</p>

      {/* ── TAGLINE ── */}
      <p style={styles.tagline}>{TAGLINE}</p>

      {/* ── SUBTITLE ── */}
      <p style={styles.subtitle}>{SUBTITLE}</p>

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
    gap: '24px',
    marginBottom: '8px',
  },
  logoPlaceholder: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    opacity: 0.9,
  },
  divider: {
    width: '1px',
    height: '48px',
    backgroundColor: 'rgba(255,255,255,0.6)',
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
