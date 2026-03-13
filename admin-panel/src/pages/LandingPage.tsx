import { useEffect, useRef, useState } from 'react';
import { publicApi } from '../api/public';
import type { LeaderboardEntry } from '../types';
import { getLangFromDomain, type Lang } from '../utils/locale';

interface FooterNavColumn {
  heading: string;
  links: string[];
}

interface MerchItem {
  title: string;
  description: string;
}

interface StepItem {
  img: string;
  alt: string;
  title: string;
  sub: string | null;
  subLink: boolean;
  imageStyle: 'banner' | 'icon';
}

interface LandingCopy {
  enterHere: string;
  howToWin: string;
  officialTagline: string;
  leaderboardNav: [string, string, string, string];
  searchPlaceholder: string;
  searchButton: string;
  tableHeaders: [string, string, string, string];
  noResults: string;
  prizesTitle: string;
  prizesIntro: string;
  prizesBlocks: Array<{ title: string; body: string }>;
  merchItems: MerchItem[];
  howToHaveYourBreak: string;
  steps: StepItem[];
  enterNow: string;
  terms: string;
  connectWithUs: string;
  footerNav: FooterNavColumn[];
  legalLinks: [string, string, string, string];
}

const LANDING_COPY: Record<Lang, LandingCopy> = {
  geo: {
    enterHere: 'Enter Here',
    howToWin: 'How To Win',
    officialTagline: 'Formula 1®-ის ოფიციალური პარტნიორი',
    leaderboardNav: ['პრიზები', 'გამარჯვებულები', 'წესები', 'კონტაქტი'],
    searchPlaceholder: 'ჩაწერე შენი უნიკალური კოდი',
    searchButton: 'ძიება',
    tableHeaders: ['პოზიცია', 'მონაწილის კოდი', 'სულ შეფუთვები', 'დარჩენილი შეფუთვები'],
    noResults: 'შედეგი ვერ მოიძებნა',
    prizesTitle: 'Prizes to be won',
    prizesIntro: "Starting in 2025, we're turning up the heat with a whole season of awesome. Think:",
    prizesBlocks: [
      {
        title: 'Grand Prix™ Goodies:',
        body: "Keep your eyes peeled for exclusive KitKat F1® packs. They're collector's items you can actually eat!",
      },
      {
        title: 'Fan Zone Fun:',
        body: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even a chance to design your own KitKat wrapper!",
      },
      {
        title: 'Pit Stop Prizes:',
        body: "We're giving away a whole bunch of cool stuff, from F1® merchandise to VIP race experiences. Stay tuned to find out how to enter!",
      },
    ],
    merchItems: [
      {
        title: 'Nestle KitKat F1® Helmet',
        description: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even",
      },
      {
        title: 'Nestle KitKat F1® Helmet',
        description: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even",
      },
      {
        title: 'Nestle KitKat F1® Helmet',
        description: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even",
      },
      {
        title: 'Nestle KitKat F1® Jacket',
        description: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even",
      },
      {
        title: 'Nestle KitKat F1® Cap',
        description: "Immerse yourself in the KitKat experience at select races. We're talking interactive games, photo ops, and maybe even",
      },
    ],
    howToHaveYourBreak: 'How to have your break',
    steps: [
      {
        img: '/landing/how-break-entry1.png',
        alt: 'Buy KitKat bar',
        title: 'Buy your KitKat promotional bar',
        sub: 'See full list of participating bars here',
        subLink: true,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-entry2.png',
        alt: 'Have a break',
        title: 'Have a break!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-location.png',
        alt: 'Enter batch code',
        title: 'Enter your bar, batch code & personal details',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-win-ge.png',
        alt: 'Claim your break',
        title: 'Claim your break!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
    ],
    enterNow: 'Enter Now',
    terms: 'Terms & Conditions',
    connectWithUs: 'Connect with us',
    footerNav: [
      { heading: 'NEWS', links: ['Latest News'] },
      { heading: 'ABOUT', links: ['History'] },
      { heading: 'CAMPAIGNS', links: ['Candy Crush KitKat', 'Formula 1'] },
      { heading: 'CONTACT US', links: ['Global Contact', 'Find your region'] },
    ],
    legalLinks: ['Terms & Conditions', 'Privacy Policy', 'Cookie Consent', 'Sitemap'],
  },
  aze: {
    enterHere: 'Burada Qoşul',
    howToWin: 'Necə Qazanmaq Olar',
    officialTagline: 'Formula 1®-in rəsmi tərəfdaşı',
    leaderboardNav: ['Mükafatlar', 'Qaliblər', 'Qaydalar', 'Əlaqə'],
    searchPlaceholder: 'Unikal kodunu daxil et',
    searchButton: 'Axtar',
    tableHeaders: ['Mövqe', 'İştirakçı kodu', 'Ümumi qablaşdırma', 'Qalan qablaşdırma'],
    noResults: 'Nəticə tapılmadı',
    prizesTitle: 'Qazanılacaq mükafatlar',
    prizesIntro: '2025-ci ildən etibarən bütün mövsüm boyu həyəcanı artırırıq. Səni bunlar gözləyir:',
    prizesBlocks: [
      {
        title: 'Grand Prix™ hədiyyələri:',
        body: 'Eksklüziv KitKat F1® qablaşdırmalarına diqqət et. Bunlar həm kolleksiya məhsuludur, həm də ləzzətlidir!',
      },
      {
        title: 'Fan zona əyləncəsi:',
        body: 'Seçilmiş yarışlarda KitKat təcrübəsinə qoşul. İnteraktiv oyunlar, foto zonalar və hətta öz KitKat qabını dizayn etmək şansı səni gözləyir!',
      },
      {
        title: 'Pit stop mükafatları:',
        body: 'F1® məhsullarından VIP yarış təcrübələrinə qədər bir çox möhtəşəm hədiyyə təqdim edirik. Necə qoşulacağını öyrənmək üçün bizi izləməyə davam et!',
      },
    ],
    merchItems: [
      {
        title: 'Nestle KitKat F1® Dəbilqə',
        description: 'Seçilmiş yarışlarda KitKat təcrübəsinin bir parçası ol. İnteraktiv oyunlar, foto fürsətləri və daha çoxu səni gözləyir.',
      },
      {
        title: 'Nestle KitKat F1® Dəbilqə',
        description: 'Seçilmiş yarışlarda KitKat təcrübəsinin bir parçası ol. İnteraktiv oyunlar, foto fürsətləri və daha çoxu səni gözləyir.',
      },
      {
        title: 'Nestle KitKat F1® Dəbilqə',
        description: 'Seçilmiş yarışlarda KitKat təcrübəsinin bir parçası ol. İnteraktiv oyunlar, foto fürsətləri və daha çoxu səni gözləyir.',
      },
      {
        title: 'Nestle KitKat F1® Gödəkçə',
        description: 'Seçilmiş yarışlarda KitKat təcrübəsinin bir parçası ol. İnteraktiv oyunlar, foto fürsətləri və daha çoxu səni gözləyir.',
      },
      {
        title: 'Nestle KitKat F1® Papaq',
        description: 'Seçilmiş yarışlarda KitKat təcrübəsinin bir parçası ol. İnteraktiv oyunlar, foto fürsətləri və daha çoxu səni gözləyir.',
      },
    ],
    howToHaveYourBreak: 'Fasiləni necə yaşamaq olar',
    steps: [
      {
        img: '/landing/how-break-entry1.png',
        alt: 'KitKat batonunu al',
        title: 'Promosyonlu KitKat batonunu al',
        sub: 'İştirak edən batonların tam siyahısına burada bax',
        subLink: true,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-entry2.png',
        alt: 'Fasilə ver',
        title: 'Fasilə ver!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-location.png',
        alt: 'Partiya kodunu daxil et',
        title: 'Batonunun kodunu, partiya kodunu və şəxsi məlumatlarını daxil et',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-win-az.png',
        alt: 'Mükafatını qazan',
        title: 'Mükafatını qazan!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
    ],
    enterNow: 'İndi Qoşul',
    terms: 'Şərtlər və Qaydalar',
    connectWithUs: 'Bizimlə əlaqə saxla',
    footerNav: [
      { heading: 'XƏBƏRLƏR', links: ['Son xəbərlər'] },
      { heading: 'HAQQIMIZDA', links: ['Tarixçə'] },
      { heading: 'KAMPANİYALAR', links: ['Candy Crush KitKat', 'Formula 1'] },
      { heading: 'ƏLAQƏ', links: ['Qlobal əlaqə', 'Regionunu tap'] },
    ],
    legalLinks: ['Şərtlər və Qaydalar', 'Məxfilik Siyasəti', 'Cookie Razılığı', 'Sayt xəritəsi'],
  },
  arm: {
    enterHere: 'Մասնակցիր այստեղ',
    howToWin: 'Ինչպես հաղթել',
    officialTagline: 'Formula 1®-ի պաշտոնական գործընկեր',
    leaderboardNav: ['Մրցանակներ', 'Հաղթողներ', 'Կանոններ', 'Կապ'],
    searchPlaceholder: 'Մուտքագրիր քո եզակի կոդը',
    searchButton: 'Որոնել',
    tableHeaders: ['Դիրք', 'Մասնակցի կոդ', 'Ընդհանուր փաթեթներ', 'Մնացած փաթեթներ'],
    noResults: 'Արդյունք չի գտնվել',
    prizesTitle: 'Մրցանակներ, որոնք կարելի է շահել',
    prizesIntro: '2025-ից սկսած մենք ամբողջ սեզոնը դարձնում ենք ավելի հետաքրքիր։ Ահա թե ինչ է սպասվում քեզ.',
    prizesBlocks: [
      {
        title: 'Grand Prix™ նվերներ.',
        body: 'Հետևիր բացառիկ KitKat F1® փաթեթավորումներին։ Դրանք կոլեկցիոն առարկաներ են, որոնք նաև կարելի է ուտել։',
      },
      {
        title: 'Երկրպագուների գոտու զվարճանքներ.',
        body: 'Միացիր KitKat փորձառությանը ընտրված մրցարշավներում։ Սպասվում են ինտերակտիվ խաղեր, լուսանկարվելու գոտիներ և նույնիսկ քո սեփական KitKat փաթեթավորումը ձևավորելու հնարավորություն։',
      },
      {
        title: 'Pit stop մրցանակներ.',
        body: 'Մենք նվիրում ենք բազմաթիվ հիանալի մրցանակներ` F1® ատրիբուտիկայից մինչև VIP մրցարշավային փորձառություններ։ Հետևիր մեզ, որպեսզի իմանաս ինչպես մասնակցել։',
      },
    ],
    merchItems: [
      {
        title: 'Nestle KitKat F1® Սաղավարտ',
        description: 'Դարձիր KitKat փորձառության մի մասը ընտրված մրցարշավներում։ Ինտերակտիվ խաղեր, լուսանկարվելու պահեր և շատ ավելին քեզ են սպասում։',
      },
      {
        title: 'Nestle KitKat F1® Սաղավարտ',
        description: 'Դարձիր KitKat փորձառության մի մասը ընտրված մրցարշավներում։ Ինտերակտիվ խաղեր, լուսանկարվելու պահեր և շատ ավելին քեզ են սպասում։',
      },
      {
        title: 'Nestle KitKat F1® Սաղավարտ',
        description: 'Դարձիր KitKat փորձառության մի մասը ընտրված մրցարշավներում։ Ինտերակտիվ խաղեր, լուսանկարվելու պահեր և շատ ավելին քեզ են սպասում։',
      },
      {
        title: 'Nestle KitKat F1® Բաճկոն',
        description: 'Դարձիր KitKat փորձառության մի մասը ընտրված մրցարշավներում։ Ինտերակտիվ խաղեր, լուսանկարվելու պահեր և շատ ավելին քեզ են սպասում։',
      },
      {
        title: 'Nestle KitKat F1® Գլխարկ',
        description: 'Դարձիր KitKat փորձառության մի մասը ընտրված մրցարշավներում։ Ինտերակտիվ խաղեր, լուսանկարվելու պահեր և շատ ավելին քեզ են սպասում։',
      },
    ],
    howToHaveYourBreak: 'Ինչպես անցկացնել քո ընդմիջումը',
    steps: [
      {
        img: '/landing/how-break-entry1.png',
        alt: 'Գնիր KitKat բատոն',
        title: 'Գնիր քո պրոմո KitKat բատոնը',
        sub: 'Մասնակցող բատոնների ամբողջ ցանկը տես այստեղ',
        subLink: true,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-entry2.png',
        alt: 'Ընդմիջում արա',
        title: 'Ընդմիջում արա!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-location.png',
        alt: 'Մուտքագրիր խմբաքանակի կոդը',
        title: 'Մուտքագրիր բատոնի, խմբաքանակի կոդը և անձնական տվյալները',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
      {
        img: '/landing/how-break-win-am.png',
        alt: 'Ստացիր մրցանակդ',
        title: 'Ստացիր մրցանակդ!',
        sub: null,
        subLink: false,
        imageStyle: 'icon',
      },
    ],
    enterNow: 'Մասնակցիր հիմա',
    terms: 'Պայմաններ և կանոններ',
    connectWithUs: 'Կապվիր մեզ հետ',
    footerNav: [
      { heading: 'ՆՈՐՈՒԹՅՈՒՆՆԵՐ', links: ['Վերջին նորություններ'] },
      { heading: 'ՄԵՐ ՄԱՍԻՆ', links: ['Պատմություն'] },
      { heading: 'ԱՐՇԱՎՆԵՐ', links: ['Candy Crush KitKat', 'Formula 1'] },
      { heading: 'ԿԱՊ', links: ['Գլոբալ կապ', 'Գտիր քո տարածաշրջանը'] },
    ],
    legalLinks: ['Պայմաններ և կանոններ', 'Գաղտնիության քաղաքականություն', 'Cookie-ի համաձայնություն', 'Կայքի քարտեզ'],
  },
};

const BRAND_RED_PRIMARY = '#db0f24';
const BRAND_RED_SECONDARY = '#c20018';
const BRAND_RED_DARK = '#8b0000';

const PITBOARD_BY_LANG: Record<Lang, string> = {
  geo: '/landing/pitboard-ge.png',
  aze: '/landing/pitboard-az.png',
  arm: '/landing/pitboard-am.png',
};

const PRIZES_BANNER_BY_LANG: Record<Lang, string> = {
  geo: '/landing/prizes-banner-ge.jpg',
  aze: '/landing/prizes-banner-az.jpg',
  arm: '/landing/prizes-banner-am.jpg',
};

const MERCH_TITLE_BY_LANG: Record<Lang, string> = {
  geo: '/landing/merch-title-ge.png',
  aze: '/landing/merch-title-az.png',
  arm: '/landing/merch-title-am.png',
};

export function LandingPage() {
  const lang = getLangFromDomain();
  const copy = LANDING_COPY[lang];
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbSearch, setLbSearch] = useState('');

  useEffect(() => {
    publicApi.getLeaderboard(100).then(setLeaderboard).catch(() => setLeaderboard([]));
  }, []);

  const filteredLb = lbSearch.trim()
    ? leaderboard.filter((e) => e.uniqueId.toLowerCase().includes(lbSearch.trim().toLowerCase()))
    : leaderboard;
  const merchScrollRef = useRef<HTMLDivElement>(null);
  function prevMerch() {
    merchScrollRef.current?.scrollBy({ left: -merchScrollRef.current.clientWidth, behavior: 'smooth' });
  }
  function nextMerch() {
    merchScrollRef.current?.scrollBy({ left: merchScrollRef.current.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#111]">
      {/* ── Header ── */}
      <header className="text-white" style={{ background: BRAND_RED_PRIMARY }}>
        <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center px-4 sm:px-6 lg:px-8">
          <img src="/kitkat.png" alt="KitKat" className="h-7 w-auto object-contain" />
        </div>
      </header>

      {/* ── Hero video + pitboard ── */}
      {/* Mobile: full-viewport-height with video as bg; md+: natural video height */}
      <section className="relative w-full overflow-hidden h-[55svh] md:h-auto">
        <video
          src="/video/hero-banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover md:static md:h-auto md:w-full"
        />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[20%] sm:block sm:pt-0">
          <img
            src={PITBOARD_BY_LANG[lang]}
            alt="Pitboard"
            className="relative h-[108%] w-auto max-w-none object-contain object-top sm:absolute sm:-left-[4%] sm:top-[10%] sm:h-auto sm:w-[30%] md:left-[2%] md:top-[14%] md:w-[27%] lg:left-[8%] lg:top-[18%] lg:w-[24%]"
            style={{ aspectRatio: '1020 / 1560', transform: 'rotate(-3deg)', transformOrigin: 'top center' }}
          />
        </div>
      </section>


      {/* ── Enter Here / How To Win buttons ── */}
      <section
        className="relative z-10 flex flex-col items-center justify-center gap-3 px-6 py-8 sm:flex-row sm:gap-6 sm:px-16 sm:py-10"
        style={{ backgroundImage: 'url(/landing/bar-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <a
          href="#enter"
          className="w-full max-w-sm rounded-lg bg-white px-10 py-4 text-center text-lg font-bold italic sm:w-auto sm:flex-1"
          style={{ color: BRAND_RED_PRIMARY, fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
        >
          {copy.enterHere}
        </a>
        <a
          href="#how-to-win"
          className="w-full max-w-sm rounded-lg bg-white px-10 py-4 text-center text-lg font-bold italic sm:w-auto sm:flex-1"
          style={{ color: BRAND_RED_PRIMARY, fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
        >
          {copy.howToWin}
        </a>
      </section>

      {/* ── Leaderboard ── */}
      <section
        id="enter"
        className="flex flex-col items-center px-4 py-10 sm:px-10 sm:py-14"
        style={{ background: BRAND_RED_PRIMARY }}
      >
        {/* Logos + tagline + nav */}
        <div className="mb-8 w-full max-w-4xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Logos + tagline */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-3">
                <img src="/formula.png" alt="Formula 1" className="h-8 w-auto object-contain sm:h-10" />
                <div className="h-8 w-px bg-white/40 sm:h-10" />
                <img src="/kitkat.png" alt="KitKat" className="h-8 w-auto object-contain sm:h-10" />
              </div>
              <p className="mt-1 text-[11px] text-white/70">{copy.officialTagline}</p>
            </div>

            {/* Nav buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              {[
                {
                  label: copy.leaderboardNav[0],
                  href: '#prizes',
                  icon: (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7a5 5 0 01-5-5c0 0 2.5 0 5 5zM12 7a5 5 0 005-5c0 0-2.5 0-5 5z" />
                    </svg>
                  ),
                },
                {
                  label: copy.leaderboardNav[1],
                  href: '#enter',
                  icon: (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4M5 3h14l-2 8a5 5 0 01-10 0L5 3zM3 3h2m16 0h-2" />
                    </svg>
                  ),
                },
                {
                  label: copy.leaderboardNav[2],
                  href: '#how-to-win',
                  icon: (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z" />
                    </svg>
                  ),
                },
                {
                  label: copy.leaderboardNav[3],
                  href: '#contact',
                  icon: (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs transition-colors hover:bg-gray-50"
                  style={{ color: BRAND_RED_PRIMARY }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-8 flex w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <input
            type="text"
            value={lbSearch}
            onChange={(e) => setLbSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="flex-1 bg-transparent px-5 py-3.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
          <button
            className="px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND_RED_DARK }}
          >
            {copy.searchButton}
          </button>
        </div>

        {/* Table */}
        <div
          className="w-full max-w-4xl overflow-hidden rounded-xl border-2"
          style={{ borderColor: 'rgba(255,255,255,0.25)' }}
        >
          {/* Scrollable body */}
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '272px' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead className="sticky top-0 z-10">
                <tr style={{ background: BRAND_RED_SECONDARY }}>
                  {copy.tableHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-center text-sm font-semibold text-white"
                      style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLb.length === 0 ? (
                  <tr style={{ background: BRAND_RED_PRIMARY }}>
                    <td colSpan={4} className="py-10 text-center text-white/60">
                      {copy.noResults}
                    </td>
                  </tr>
                ) : (
                  filteredLb.map((entry, i) => (
                    <tr
                      key={entry.uniqueId}
                      style={{ background: i % 2 === 0 ? BRAND_RED_PRIMARY : BRAND_RED_SECONDARY }}
                    >
                      <td className="px-5 py-3 text-center text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)' }}>{entry.rank}</td>
                      <td className="px-5 py-3 text-center font-mono text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)' }}>{entry.uniqueId}</td>
                      <td className="px-5 py-3 text-center text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)' }}>{entry.totalPoints}</td>
                      <td className="px-5 py-3 text-center text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>{entry.activePoints}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Scrollbar hint — right red strip */}
          <div className="absolute right-0 top-0 h-full w-1.5 rounded-r-xl" style={{ background: BRAND_RED_DARK }} />
        </div>
      </section>

      {/* ── Prizes to be won ── */}
      <section id="how-to-win" className="flex flex-col overflow-hidden sm:flex-row sm:gap-0">
        {/* Text panel */}
        <div className="flex flex-col gap-5 overflow-hidden bg-black px-8 py-8 sm:w-[42%] sm:shrink-0 sm:px-10 sm:py-10">
          {/* Red title banner — SVG shape from brand assets */}
          <div className="relative -mx-8 sm:-mx-10">
            <div
              className="relative px-8 py-3.5 sm:px-10 sm:py-4"
              style={{
                backgroundImage: 'url(/landing/banner-red-wide.svg)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
                minHeight: '56px',
              }}
            >
              <span
                className="relative z-10 block text-lg font-black italic text-white sm:text-xl"
                style={{
                  fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif",
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {copy.prizesTitle}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-white/90" style={{ fontFamily: "Arial, sans-serif" }}>
            <p className="font-bold italic">
              {copy.prizesIntro}
            </p>
            <p>
              <span className="font-bold italic">{copy.prizesBlocks[0].title}</span>{' '}
              <span className="italic">{copy.prizesBlocks[0].body}</span>
            </p>
            <p>
              <span className="font-bold italic">{copy.prizesBlocks[1].title}</span>{' '}
              <span className="italic">{copy.prizesBlocks[1].body}</span>
            </p>
            <p>
              <span className="font-bold italic">{copy.prizesBlocks[2].title}</span>{' '}
              <span className="italic">{copy.prizesBlocks[2].body}</span>
            </p>
          </div>

        </div>

        {/* Localized prize image */}
        <div className="relative -ml-px flex-1 overflow-hidden sm:shrink" style={{ minHeight: '300px' }}>
          <img
            src={PRIZES_BANNER_BY_LANG[lang]}
            alt={copy.prizesTitle}
            className="block h-full w-full object-cover"
          />
        </div>
      </section>

      {/* ── Merch ── */}
      <section className="overflow-hidden bg-white pb-0 pt-10">
        <style>{`[data-merch-scroll]::-webkit-scrollbar{display:none}`}</style>
        {/* Title — localized image centered above content */}
        <div className="flex w-full justify-center px-4 pb-8">
          <img
            src={MERCH_TITLE_BY_LANG[lang]}
            alt=""
            className="h-auto w-full max-w-md object-contain"
          />
        </div>

        {/* Carousel: mobile = 1 centered scroll + arrows, laptop = 3 columns grid */}
        <div className="relative">
          <div
            ref={merchScrollRef}
            data-merch-scroll
            className="flex overflow-x-auto scroll-smooth md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-4"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {copy.merchItems.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col items-center justify-center text-center min-w-full w-full md:min-w-0 md:w-auto md:shrink"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                className="mb-5 aspect-square w-full max-w-[208px] rounded-full"
                style={{ background: BRAND_RED_PRIMARY }}
              />
              <p
                className="mb-2 text-base font-black italic"
                style={{ fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
              >
                {item.title}
              </p>
              <p className="max-w-[200px] text-sm italic text-gray-500 leading-snug">{item.description}</p>
            </div>
          ))}
          </div>

          {/* Arrows — mobile only */}
          <button
            onClick={prevMerch}
            aria-label="Previous merch"
            className="absolute left-2 top-[104px] -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white text-lg font-black md:hidden"
            style={{ background: BRAND_RED_PRIMARY }}
          >
            ❮
          </button>
          <button
            onClick={nextMerch}
            aria-label="Next merch"
            className="absolute right-2 top-[104px] -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white text-lg font-black md:hidden"
            style={{ background: BRAND_RED_PRIMARY }}
          >
            ❯
          </button>
        </div>

        {/* Checkered flag bottom border */}
        <div
          className="mt-10 h-8 w-full"
          style={{
            backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)',
            backgroundSize: '32px 32px',
          }}
        />
      </section>

      {/* ── How to have your break ── */}
      <section className="relative flex flex-col overflow-hidden sm:flex-row" style={{ background: BRAND_RED_PRIMARY }}>
        {/* Left: content panel */}
        <div className="flex flex-col overflow-hidden px-8 py-8 sm:w-[52%] sm:px-10 sm:py-10">
          {/* White title banner — diagonal right edge, solid white */}
          <div className="relative -mx-8 sm:-mx-10">
            <div
              className="relative px-6 py-3.5 sm:px-8 sm:py-4"
              style={{
                background: '#ffffff',
                clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)',
                minHeight: '56px',
              }}
            >
              <span
                className="relative z-10 block text-lg font-black italic sm:text-xl"
                style={{
                  color: BRAND_RED_PRIMARY,
                  fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif",
                }}
              >
                {copy.howToHaveYourBreak}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:mt-6 sm:pr-0">

            {/* 4 steps */}
            <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-7">
              {copy.steps.map((step) => (
                <div key={step.img} className="flex flex-col items-start gap-2">
                  <div
                    className={
                      step.imageStyle === 'banner'
                        ? 'flex h-12 w-full max-w-[220px] items-center sm:h-14 sm:max-w-[250px]'
                        : 'h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24'
                    }
                  >
                    <img
                      src={step.img}
                      alt={step.alt}
                      className={
                        step.imageStyle === 'banner'
                          ? 'h-full w-full object-contain object-left'
                          : 'h-full w-full object-contain'
                      }
                    />
                  </div>
                  <p className="text-sm font-bold italic text-white leading-tight">{step.title}</p>
                  {step.sub && (
                    step.subLink
                      ? <a href="#" className="text-xs italic text-white/80 underline">{step.sub}</a>
                      : <p className="text-xs italic text-white/80">{step.sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:max-w-xs">
              <a
                href="#enter"
                className="rounded-lg bg-white py-3 text-center text-base font-black italic transition-opacity hover:opacity-90"
                style={{ color: BRAND_RED_PRIMARY, fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
              >
                {copy.enterNow}
              </a>
              <a
                href="#"
                className="rounded-lg bg-white py-3 text-center text-base font-black italic transition-opacity hover:opacity-90"
                style={{ color: BRAND_RED_PRIMARY, fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
              >
                {copy.terms}
              </a>
            </div>

          </div>
        </div>

        {/* Right: car */}
        <div className="relative flex flex-1 items-end justify-end overflow-hidden sm:min-h-[400px]">
          <img
            src="/landing/car-transparent.png"
            alt="KitKat F1 car"
            className="w-full object-contain object-bottom object-right"
            style={{ maxHeight: '520px' }}
          />
        </div>
      </section>

      {/* Legal — full width below section */}
      <div className="px-6 pb-6 text-center" style={{ background: BRAND_RED_PRIMARY }}>
        <p className="text-[10px] leading-relaxed text-white/60 italic">
          The F1 FORMULA 1 logo, F1 logo, F1, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX
          and related marks are trademarks of Formula One Licensing BV, a Formula 1 company
        </p>
      </div>

      {/* ── Footer ── */}
      <footer>
        {/* Red top band */}
        <div
          className="px-6 py-8 sm:px-12"
          style={{ background: BRAND_RED_PRIMARY }}
        >
          <div className="mx-auto flex max-w-[1320px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Connect with us */}
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-wider text-white">
                {copy.connectWithUs}
              </p>
              <div className="flex items-center gap-4">
                {/* Facebook */}
                <a href="#" aria-label="Facebook" className="text-white opacity-90 hover:opacity-100">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="text-white opacity-90 hover:opacity-100">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="#" aria-label="X" className="text-white opacity-90 hover:opacity-100">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* YouTube */}
                <a href="#" aria-label="YouTube" className="text-white opacity-90 hover:opacity-100">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                {/* TikTok */}
                <a href="#" aria-label="TikTok" className="text-white opacity-90 hover:opacity-100">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.16 8.16 0 004.77 1.52V7.01a4.85 4.85 0 01-1-.32z"/></svg>
                </a>
              </div>
            </div>

            {/* Have a break tagline */}
            <p
              className="text-2xl font-black italic text-white sm:text-3xl"
              style={{ fontFamily: "'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif" }}
            >
              Have a <span style={{ textDecoration: 'line-through', textDecorationStyle: 'solid' }}>break</span>,<br />
              have a{' '}
              <img src="/kitkat.png" alt="KitKat" className="inline h-8 w-auto object-contain align-middle" />
            </p>
          </div>
        </div>

        {/* White nav band */}
        <div className="border-b border-gray-200 bg-white px-6 py-8 sm:px-12">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-6 sm:grid-cols-4">
            {copy.footerNav.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-white px-6 py-4 sm:px-12">
          <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <img src="/kitkat.png" alt="KitKat" className="h-8 w-auto object-contain opacity-70" />
            <p className="text-center text-xs text-gray-400">
              © 2024 Nestlé Limited, all rights reserved
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              {copy.legalLinks.map((item) => (
                <a key={item} href="#" className="hover:text-gray-900">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
