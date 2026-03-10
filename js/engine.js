/**
 * Svādhyāya - Complete Vedic Astronomical Engine
 * All calculations run 100% in the browser. No server. No tracking.
 */
'use strict';

const VedicEngine = (() => {
  const DEG = Math.PI / 180;
  const J2000 = 2451545.0;

  // ── Julian Date ──────────────────────────────────────────────────────────
  function jd(yr, mo, dy, hr = 12, mn = 0, sc = 0, tz = 0) {
    const utH = hr - tz + mn / 60 + sc / 3600;
    let y = yr, m = mo, d = dy + utH / 24;
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  function jdToDate(jd) {
    const jd1 = jd + 0.5;
    const Z = Math.floor(jd1), F = jd1 - Z;
    let A = Z;
    if (Z >= 2299161) { const al = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + al - Math.floor(al / 4); }
    const B = A + 1524, C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    const hrs = F * 24;
    return { year, month, day, hour: Math.floor(hrs), minute: Math.floor((hrs % 1) * 60) };
  }

  const norm = a => { a %= 360; return a < 0 ? a + 360 : a; };

  // ── Lahiri Ayanamsa ───────────────────────────────────────────────────────
  function ayanamsa(jd) { return 23.853 + ((jd - J2000) / 36525) * 365.25 * (50.2388475 / 3600); }

  // ── Planet Longitudes (Tropical) ──────────────────────────────────────────
  function sunLon(jd) {
    const T = (jd - J2000) / 36525;
    const L = 280.46646 + 36000.76983 * T;
    let M = norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    return norm(L + C - 0.0000569 - 0.0000478 * Math.sin((125.04 - 1934.136 * T) * DEG));
  }

  function moonLon(jd) {
    const T = (jd - J2000) / 36525;
    const L = 218.3165 + 481267.8813 * T;
    const D = (297.8501 + 445267.1115 * T) * DEG;
    const M = (357.5291 + 35999.0503 * T) * DEG;
    const Mp = (134.9634 + 477198.8676 * T) * DEG;
    const F = (93.2721 + 483202.0175 * T) * DEG;
    return norm(L + 6.2888 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp)
      + 0.6583 * Math.sin(2 * D) + 0.2136 * Math.sin(2 * Mp)
      + 0.1851 * Math.sin(2 * D + Mp) - 0.1143 * Math.sin(F)
      + 0.0588 * Math.sin(2 * D - M) + 0.0572 * Math.sin(2 * D - M - Mp)
      + 0.0533 * Math.sin(2 * D + M) - 0.0458 * Math.sin(M - Mp));
  }

  function marsLon(jd) {
    const T = (jd - J2000) / 36525;
    const M = norm(19.387 + 19140.30 * T) * DEG;
    return norm(355.433 + 19140.299 * T + 10.691 * Math.sin(M) + 0.623 * Math.sin(2 * M));
  }

  function mercuryLon(jd) {
    const T = (jd - J2000) / 36525;
    const M = norm(174.791 + 149472.515 * T) * DEG;
    return norm(252.251 + 149472.675 * T + 23.44 * Math.sin(M) + 2.99 * Math.sin(2 * M));
  }

  function jupiterLon(jd) {
    const T = (jd - J2000) / 36525;
    const M = norm(20.020 + 3034.906 * T) * DEG;
    return norm(34.351 + 3034.906 * T + 5.555 * Math.sin(M) + 0.168 * Math.sin(2 * M));
  }

  function venusLon(jd) {
    const T = (jd - J2000) / 36525;
    const M = norm(212.448 + 58517.804 * T) * DEG;
    return norm(181.979 + 58517.815 * T + 0.77 * Math.sin(M));
  }

  function saturnLon(jd) {
    const T = (jd - J2000) / 36525;
    const M = norm(317.021 + 1222.114 * T) * DEG;
    return norm(50.077 + 1222.114 * T + 6.406 * Math.sin(M) + 0.317 * Math.sin(2 * M));
  }

  function rahuLon(jd) {
    const T = (jd - J2000) / 36525;
    return norm(125.0445 - 1934.1361 * T + 0.0020756 * T * T);
  }

  // ── Ascendant ────────────────────────────────────────────────────────────
  function ascendant(jd, lat, lon, ayan) {
    const T = (jd - J2000) / 36525;
    const GMST = norm(280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * T * T);
    const LST = norm(GMST + lon);
    const eps = (23.439291111 - 0.013004167 * T) * DEG;
    const RAMC = LST * DEG, latR = lat * DEG;
    let asc = Math.atan2(Math.cos(RAMC), -(Math.sin(RAMC) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))) / DEG;
    if (Math.cos(RAMC) < 0) asc += 180;
    return norm(norm(asc) - ayan);
  }

  // ── Full Chart ────────────────────────────────────────────────────────────
  function calcChart(yr, mo, dy, hr, mn, lat, lon, tz) {
    const jDate = jd(yr, mo, dy, hr, mn, 0, tz);
    const ay = ayanamsa(jDate);
    const sid = l => norm(l - ay);
    const pos = {
      Sun: sid(sunLon(jDate)), Moon: sid(moonLon(jDate)),
      Mars: sid(marsLon(jDate)), Mercury: sid(mercuryLon(jDate)),
      Jupiter: sid(jupiterLon(jDate)), Venus: sid(venusLon(jDate)),
      Saturn: sid(saturnLon(jDate)), Rahu: sid(rahuLon(jDate)),
      Ketu: norm(sid(rahuLon(jDate)) + 180),
      Ascendant: ascendant(jDate, lat, lon, ay)
    };
    const enrich = {};
    for (const [k, v] of Object.entries(pos)) {
      const ri = Math.floor(v / 30) % 12;
      const ni = Math.floor(v / (360 / 27)) % 27;
      enrich[k] = { lon: v, rashiIdx: ri, rashi: RASHIS[ri], degInRashi: (v % 30).toFixed(2), nak: NAKSHATRAS[ni], pada: Math.floor((v % (360 / 27)) / (360 / 108)) + 1 };
    }
    return { planets: enrich, jd: jDate, ayanamsa: ay, inputJd: jDate };
  }

  // ── Sunrise / Sunset ─────────────────────────────────────────────────────
  function sunriseSunset(yr, mo, dy, lat, lon, tz) {
    const jdn = jd(yr, mo, dy, 12, 0, 0, 0);
    const n = jdn - 2451545.0;
    const Lsun = norm(280.460 + 0.9856474 * n);
    const g = norm(357.528 + 0.9856003 * n) * DEG;
    const lambda = (Lsun + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
    const eps = 23.439 * DEG;
    const sinDec = Math.sin(eps) * Math.sin(lambda);
    const dec = Math.asin(sinDec);
    const cosH = (Math.cos(1.5708) - Math.sin(dec) * Math.sin(lat * DEG)) / (Math.cos(dec) * Math.cos(lat * DEG));
    if (Math.abs(cosH) > 1) return { sunrise: null, sunset: null };
    const H = Math.acos(cosH) / DEG;
    const transit = 12 - (lon / 15) + tz;
    const rise = transit - H / 15;
    const set = transit + H / 15;
    const fmt = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return `${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    return { sunrise: fmt(rise), sunset: fmt(set), riseH: rise, setH: set };
  }

  // ── Moonrise / Moonset (approximate) ────────────────────────────────────
  function moonriseMoonset(yr, mo, dy, lat, lon, tz) {
    const jdn = jd(yr, mo, dy, 12, 0, 0, 0);
    const ml = moonLon(jdn) * DEG;
    const eps = 23.439 * DEG;
    const sinDec = Math.sin(eps) * Math.sin(ml);
    const dec = Math.asin(sinDec);
    const cosH = (Math.cos(5 * DEG) - Math.sin(dec) * Math.sin(lat * DEG)) / (Math.cos(dec) * Math.cos(lat * DEG));
    if (Math.abs(cosH) > 1) return { moonrise: '--:--', moonset: '--:--' };
    const H = Math.acos(cosH) / DEG;
    const moonLonDeg = moonLon(jdn);
    const transit = 12 + (moonLonDeg - sunLon(jdn)) / 15 - lon / 15 + tz;
    const rise = ((transit - H / 15) % 24 + 24) % 24;
    const set = ((transit + H / 15) % 24 + 24) % 24;
    const fmt = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return `${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    return { moonrise: fmt(rise), moonset: fmt(set) };
  }

  // ── Tithi ────────────────────────────────────────────────────────────────
  const TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'];
  function tithi(sunL, moonL) {
    const diff = norm(moonL - sunL);
    const tNum = Math.floor(diff / 12) + 1;
    const tPct = ((diff % 12) / 12 * 100).toFixed(0);
    const paksha = diff < 180 ? 'Shukla' : 'Krishna';
    const tIdx = Math.floor(diff / 12) % 15;
    const name = tNum === 15 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHIS[tIdx];
    return { number: tNum, name, paksha, percent: tPct };
  }

  // ── Nakshatra from longitude ─────────────────────────────────────────────
  function nakFromLon(lon) {
    const idx = Math.floor(lon / (360 / 27)) % 27;
    const pada = Math.floor((lon % (360 / 27)) / (360 / 108)) + 1;
    return { ...NAKSHATRAS[idx], pada };
  }

  // ── Yoga ─────────────────────────────────────────────────────────────────
  const YOGAS = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  function yoga(sunL, moonL) {
    const sum = norm(sunL + moonL);
    const idx = Math.floor(sum / (360 / 27)) % 27;
    return { name: YOGAS[idx], index: idx + 1 };
  }

  // ── Karana ───────────────────────────────────────────────────────────────
  const KARANAS = ['Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'];
  function karana(sunL, moonL) {
    const diff = norm(moonL - sunL);
    const idx = Math.floor(diff / 6) % 11;
    return { name: KARANAS[idx] };
  }

  // ── Vaar (weekday) ───────────────────────────────────────────────────────
  const VAARS = ['Ravivaar','Somvaar','Mangalvaar','Budhvaar','Guruvaar','Shukravaar','Shanivaar'];
  const VAAR_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function vaar(jdn) { return { hi: VAARS[Math.floor(jdn + 1.5) % 7], en: VAAR_EN[Math.floor(jdn + 1.5) % 7] }; }

  // ── Rahu Kaal, Gulika, Yamagandam ─────────────────────────────────────────
  const RAHU_ORDER_SUN = [8, 2, 7, 5, 6, 4, 3]; // index by weekday (Sun=0)
  const GULIKA_ORDER = [6, 5, 4, 3, 2, 1, 0];
  const YAMA_ORDER = [5, 4, 3, 2, 1, 0, 6];

  function inauspiciousTimes(riseH, setH, weekday) {
    const dur = (setH - riseH) / 8;
    const wdIdx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(weekday);
    const fmt = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h % 1) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    const rk = RAHU_ORDER_SUN[wdIdx];
    const gk = GULIKA_ORDER[wdIdx];
    const yk = YAMA_ORDER[wdIdx];
    return {
      rahuKaal: { start: fmt(riseH + rk * dur), end: fmt(riseH + (rk + 1) * dur) },
      gulikaKaal: { start: fmt(riseH + gk * dur), end: fmt(riseH + (gk + 1) * dur) },
      yamagandam: { start: fmt(riseH + yk * dur), end: fmt(riseH + (yk + 1) * dur) }
    };
  }

  // ── Abhijit Muhurat ──────────────────────────────────────────────────────
  function abhijitMuhurat(riseH, setH) {
    const midday = (riseH + setH) / 2;
    const half = (setH - riseH) / 15;
    const fmt = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h % 1) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    return { start: fmt(midday - half), end: fmt(midday + half) };
  }

  // ── Choghadiya ───────────────────────────────────────────────────────────
  const CHOG_NAMES = ['Udveg','Chal','Labh','Amrit','Kaal','Shubh','Rog','Udveg'];
  const CHOG_DAY = { 0:[1,2,3,4,5,6,7,0], 1:[4,5,6,7,0,1,2,3], 2:[7,0,1,2,3,4,5,6], 3:[2,3,4,5,6,7,0,1], 4:[5,6,7,0,1,2,3,4], 5:[0,1,2,3,4,5,6,7], 6:[3,4,5,6,7,0,1,2] };
  const CHOG_QUALITY = { Amrit:'✨ Excellent', Shubh:'✅ Auspicious', Labh:'✅ Auspicious', Chal:'⚪ Neutral', Udveg:'⚠️ Avoid', Rog:'⚠️ Avoid', Kaal:'⛔ Inauspicious' };
  function choghadiya(riseH, setH, weekday) {
    const wdIdx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(weekday);
    const dur = (setH - riseH) / 8;
    const fmt = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h % 1) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    return CHOG_DAY[wdIdx].slice(0, 8).map((ci, i) => ({
      name: CHOG_NAMES[ci], quality: CHOG_QUALITY[CHOG_NAMES[ci]] || '⚪ Neutral',
      start: fmt(riseH + i * dur), end: fmt(riseH + (i + 1) * dur)
    }));
  }

  // ── Hora ─────────────────────────────────────────────────────────────────
  const HORA_LORDS = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
  function hora(riseH, setH, weekday) {
    const wdIdx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(weekday);
    const dur = (setH - riseH) / 12;
    const fmt = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h % 1) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
    return Array.from({ length: 12 }, (_, i) => ({
      lord: HORA_LORDS[(wdIdx + i) % 7],
      start: fmt(riseH + i * dur), end: fmt(riseH + (i + 1) * dur)
    }));
  }

  // ── Hindu Month + Samvat ─────────────────────────────────────────────────
  const HINDU_MONTHS = ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwin','Kartika','Margashirsha','Pausha','Magha','Phalguna'];
  function hinduMonth(sunL) { return HINDU_MONTHS[Math.floor(sunL / 30) % 12]; }
  function vikramSamvat(year, month) { return month <= 3 ? year + 56 : year + 57; }
  function ayana(sunL) { return (sunL >= 270 || sunL < 90) ? 'Uttarayan (उत्तरायण)' : 'Dakshinayan (दक्षिणायण)'; }
  const RITUS = ['Vasanta','Grishma','Varsha','Sharad','Hemanta','Shishira'];
  function ritu(sunL) { return RITUS[Math.floor(((sunL + 30) % 360) / 60)]; }

  // ── Moon Phase ───────────────────────────────────────────────────────────
  function moonPhase(sunL, moonL) {
    const diff = norm(moonL - sunL);
    if (diff < 15) return { name: 'New Moon', emoji: '🌑', illumination: Math.round(diff / 180 * 100) };
    if (diff < 90) return { name: 'Waxing Crescent', emoji: '🌒', illumination: Math.round(diff / 180 * 100) };
    if (diff < 105) return { name: 'First Quarter', emoji: '🌓', illumination: 50 };
    if (diff < 165) return { name: 'Waxing Gibbous', emoji: '🌔', illumination: Math.round(diff / 180 * 100) };
    if (diff < 195) return { name: 'Full Moon', emoji: '🌕', illumination: 100 };
    if (diff < 270) return { name: 'Waning Gibbous', emoji: '🌖', illumination: Math.round((360 - diff) / 180 * 100) };
    if (diff < 285) return { name: 'Last Quarter', emoji: '🌗', illumination: 50 };
    return { name: 'Waning Crescent', emoji: '🌘', illumination: Math.round((360 - diff) / 180 * 100) };
  }

  // ── Vimshottari Dasha ─────────────────────────────────────────────────────
  const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const DASHA_YRS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
  function calcDasha(moonLon, birthDate) {
    const ni = Math.floor(moonLon / (360 / 27)) % 27;
    const nak = NAKSHATRAS[ni];
    const lordIdx = DASHA_ORDER.indexOf(nak.lord);
    const nakStart = (360 / 27) * ni;
    const frac = 1 - (moonLon - nakStart) / (360 / 27);
    const dashas = [];
    let cur = new Date(birthDate);
    const firstYrs = DASHA_YRS[DASHA_ORDER[lordIdx]] * frac;
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(lordIdx + i) % 9];
      const yrs = i === 0 ? firstYrs : DASHA_YRS[lord];
      const end = new Date(cur);
      const totalDays = yrs * 365.25;
      end.setDate(end.getDate() + Math.round(totalDays));
      dashas.push({ lord, start: new Date(cur), end, years: yrs.toFixed(1), partial: i === 0 });
      cur = new Date(end);
    }
    return { dashas, nakshatra: nak };
  }

  // ── Yogas Detection ───────────────────────────────────────────────────────
  function detectYogas(planets) {
    const found = [];
    const p = planets;
    const ascIdx = p.Ascendant.rashiIdx;
    const houseof = planet => ((planet.rashiIdx - ascIdx + 12) % 12) + 1;
    // Gaja Kesari: Jupiter in kendra from Moon
    const moonJupDiff = Math.abs(p.Jupiter.rashiIdx - p.Moon.rashiIdx) % 12;
    if ([0, 3, 6, 9].includes(moonJupDiff)) found.push({ name: 'Gaja Kesari Yoga', desc: 'Jupiter in angular position from Moon. Brings wisdom, respect, and prosperity.', quality: 'auspicious' });
    // Budhaditya: Sun + Mercury in same sign
    if (p.Sun.rashiIdx === p.Mercury.rashiIdx) found.push({ name: 'Budhaditya Yoga', desc: 'Sun and Mercury conjunct. Sharp intellect, communication skills, and leadership.', quality: 'auspicious' });
    // Hamsa: Jupiter in own/exaltation sign (Cancer/Sagittarius/Pisces)
    if ([3, 8, 11].includes(p.Jupiter.rashiIdx)) found.push({ name: 'Hamsa Yoga', desc: 'Jupiter in Cancer, Sagittarius, or Pisces. Exceptional wisdom, spiritual inclination.', quality: 'auspicious' });
    // Malavya: Venus in own/exaltation in kendra
    if ([1, 6].includes(p.Venus.rashiIdx) && [0,3,6,9].includes(houseof(p.Venus) - 1)) found.push({ name: 'Malavya Yoga', desc: 'Venus strong in kendra. Beauty, wealth, artistic talent, and romantic success.', quality: 'auspicious' });
    // Ruchaka: Mars in own/exaltation in kendra
    if ([0, 7, 9].includes(p.Mars.rashiIdx) && [1,4,7,10].includes(houseof(p.Mars))) found.push({ name: 'Ruchaka Yoga', desc: 'Mars strong in kendra. Courage, leadership, physical strength, and executive ability.', quality: 'auspicious' });
    // Shasha: Saturn in own/exaltation in kendra
    if ([6, 9, 10].includes(p.Saturn.rashiIdx)) found.push({ name: 'Shasha Yoga', desc: 'Saturn in Capricorn, Aquarius, or Libra in kendra. Discipline, authority, and longevity.', quality: 'auspicious' });
    // Parivartana: two planets in each other's signs
    const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
    for (const [pA, dA] of Object.entries(p)) {
      for (const [pB, dB] of Object.entries(p)) {
        if (pA >= pB || ['Rahu','Ketu','Ascendant'].includes(pA) || ['Rahu','Ketu','Ascendant'].includes(pB)) continue;
        if (SIGN_LORDS[dA.rashiIdx] === pB && SIGN_LORDS[dB.rashiIdx] === pA) {
          found.push({ name: `Parivartana Yoga (${pA}-${pB})`, desc: `${pA} and ${pB} are in exchange. Creates a powerful connection between these planetary energies.`, quality: 'auspicious' });
        }
      }
    }
    // Kaal Sarp: all planets between Rahu-Ketu axis
    const allLons = Object.entries(p).filter(([k]) => !['Rahu','Ketu','Ascendant'].includes(k)).map(([,v]) => v.lon);
    const rahuL = p.Rahu.lon, ketuL = p.Ketu.lon;
    const inArc = l => { const d = norm(l - rahuL); const dk = norm(ketuL - rahuL); return d < dk; };
    if (allLons.every(l => inArc(l))) found.push({ name: 'Kaal Sarp Yoga', desc: 'All planets between Rahu-Ketu axis. A powerful karmic configuration calling for spiritual growth and overcoming past-life patterns.', quality: 'challenging' });
    // Mangal Dosha: Mars in houses 1,2,4,7,8,12
    const marsH = houseof(p.Mars);
    if ([1,2,4,7,8,12].includes(marsH)) found.push({ name: 'Mangal Dosha', desc: `Mars in house ${marsH}. This placement calls for conscious channeling of Mars energy in relationships. Many traditional remedies exist.`, quality: 'challenging' });
    return found;
  }

  // ── Sade Sati ─────────────────────────────────────────────────────────────
  function sadeSati(natalMoonRashi, currentSaturnLon) {
    const saturnRashi = Math.floor(currentSaturnLon / 30);
    const diff = Math.abs(saturnRashi - natalMoonRashi);
    const nd = Math.min(diff, 12 - diff);
    if (nd <= 1) {
      const phase = nd === 0 ? 'Peak (Rising)' : (saturnRashi === (natalMoonRashi - 1 + 12) % 12 ? 'Rising' : 'Setting');
      return { active: true, phase, desc: 'Saturn is transiting close to your natal Moon sign — a period of Saturn&#x27;s maximum influence calling for patience, discipline, and inner strength.' };
    }
    return { active: false, phase: null, desc: 'Sade Sati is not currently active.' };
  }

  // ── Daily Rashifal ────────────────────────────────────────────────────────
  function dailyRashifal(moonRashi, todayMoonRashi) {
    const diff = (todayMoonRashi - moonRashi + 12) % 12;
    const scores = { 0:9,1:6,2:8,3:5,4:9,5:7,6:8,7:4,8:9,9:6,10:8,11:5 };
    const score = scores[diff];
    let dayType, color;
    if (score >= 8) { dayType = 'Excellent'; color = '#10B981'; }
    else if (score >= 6) { dayType = 'Good'; color = '#F59E0B'; }
    else { dayType = 'Challenging'; color = '#EF4444'; }
    return { score, dayType, color, diff };
  }

  // ── Lucky Color / Number ──────────────────────────────────────────────────
  const RASHI_LUCKY = {
    0:{color:'Red',num:9,gem:'Coral',day:'Tuesday'},
    1:{color:'White',num:6,gem:'Diamond',day:'Friday'},
    2:{color:'Green',num:5,gem:'Emerald',day:'Wednesday'},
    3:{color:'Silver',num:2,gem:'Pearl',day:'Monday'},
    4:{color:'Gold',num:1,gem:'Ruby',day:'Sunday'},
    5:{color:'Green',num:5,gem:'Emerald',day:'Wednesday'},
    6:{color:'White',num:6,gem:'Diamond',day:'Friday'},
    7:{color:'Red',num:9,gem:'Coral',day:'Tuesday'},
    8:{color:'Yellow',num:3,gem:'Yellow Sapphire',day:'Thursday'},
    9:{color:'Blue',num:8,gem:'Blue Sapphire',day:'Saturday'},
    10:{color:'Blue',num:8,gem:'Blue Sapphire',day:'Saturday'},
    11:{color:'Yellow',num:3,gem:'Yellow Sapphire',day:'Thursday'}
  };

  // ── Kundali Milan (basic Ashta Koota) ─────────────────────────────────────
  function kundaliMilan(boy, girl) {
    const KOOTA = [
      { name: 'Varna', max: 1, fn: (b, g) => NAKSHATRAS[b.ni].varna === NAKSHATRAS[g.ni].varna ? 1 : (NAKSHATRAS[b.ni].varna > NAKSHATRAS[g.ni].varna ? 0.5 : 0) },
      { name: 'Vashya', max: 2, fn: () => 1.5 },
      { name: 'Tara', max: 3, fn: (b, g) => { const d = (g.ni - b.ni + 27) % 27; return d < 9 ? 3 : (d < 18 ? 1.5 : 1); } },
      { name: 'Yoni', max: 4, fn: (b, g) => b.ni % 7 === g.ni % 7 ? 4 : (Math.abs(b.ni - g.ni) < 3 ? 2 : 1) },
      { name: 'Graha Maitri', max: 5, fn: (b, g) => b.rashiIdx === g.rashiIdx ? 5 : 3 },
      { name: 'Gana', max: 6, fn: (b, g) => { const G = ['Deva','Manav','Rakshasa']; const bg = Math.floor(b.ni / 9), gg = Math.floor(g.ni / 9); return bg === gg ? 6 : (bg === 0 && gg === 1 || bg === 1 && gg === 0 ? 5 : 1); } },
      { name: 'Bhakut', max: 7, fn: (b, g) => { const d = (g.rashiIdx - b.rashiIdx + 12) % 12; return [2,3,4,5,6].includes(d) ? 7 : 0; } },
      { name: 'Nadi', max: 8, fn: (b, g) => { const N = [0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0,1,2]; return N[b.ni] !== N[g.ni] ? 8 : 0; } }
    ];
    const boyNi = Math.floor(boy.moonLon / (360 / 27)) % 27;
    const girlNi = Math.floor(girl.moonLon / (360 / 27)) % 27;
    const bData = { ni: boyNi, rashiIdx: Math.floor(boy.moonLon / 30) % 12 };
    const gData = { ni: girlNi, rashiIdx: Math.floor(girl.moonLon / 30) % 12 };
    let total = 0;
    const details = KOOTA.map(k => { const s = k.fn(bData, gData); total += s; return { name: k.name, score: s, max: k.max }; });
    let verdict = '', verdictColor = '';
    if (total >= 28) { verdict = 'Excellent Match'; verdictColor = '#10B981'; }
    else if (total >= 20) { verdict = 'Good Match'; verdictColor = '#F59E0B'; }
    else if (total >= 15) { verdict = 'Average Match'; verdictColor = '#F97316'; }
    else { verdict = 'Needs Attention'; verdictColor = '#EF4444'; }
    return { score: total.toFixed(1), max: 36, details, verdict, verdictColor };
  }

  // ── Numerology ────────────────────────────────────────────────────────────
  function numerology(day, month, year) {
    const sum = d => { let s = d.toString().split('').reduce((a, c) => a + parseInt(c), 0); return s > 9 ? sum(s) : s; };
    const life = sum(day + month + year);
    const birth = sum(day);
    const MEANINGS = { 1:'Leader, Independent, Innovative', 2:'Diplomat, Sensitive, Cooperative', 3:'Creative, Expressive, Social', 4:'Practical, Disciplined, Builder', 5:'Freedom, Adventurous, Versatile', 6:'Nurturing, Responsible, Harmonious', 7:'Spiritual, Analytical, Introspective', 8:'Ambitious, Powerful, Material Success', 9:'Humanitarian, Compassionate, Wisdom' };
    return { lifePath: life, birthNum: birth, lifeMeaning: MEANINGS[life] || '', birthMeaning: MEANINGS[birth] || '' };
  }

  // ── Reference Data ────────────────────────────────────────────────────────
  const RASHIS = [
    {en:'Aries',hi:'मेष',lord:'Mars',elem:'Fire',quality:'Cardinal'},
    {en:'Taurus',hi:'वृषभ',lord:'Venus',elem:'Earth',quality:'Fixed'},
    {en:'Gemini',hi:'मिथुन',lord:'Mercury',elem:'Air',quality:'Mutable'},
    {en:'Cancer',hi:'कर्क',lord:'Moon',elem:'Water',quality:'Cardinal'},
    {en:'Leo',hi:'सिंह',lord:'Sun',elem:'Fire',quality:'Fixed'},
    {en:'Virgo',hi:'कन्या',lord:'Mercury',elem:'Earth',quality:'Mutable'},
    {en:'Libra',hi:'तुला',lord:'Venus',elem:'Air',quality:'Cardinal'},
    {en:'Scorpio',hi:'वृश्चिक',lord:'Mars',elem:'Water',quality:'Fixed'},
    {en:'Sagittarius',hi:'धनु',lord:'Jupiter',elem:'Fire',quality:'Mutable'},
    {en:'Capricorn',hi:'मकर',lord:'Saturn',elem:'Earth',quality:'Cardinal'},
    {en:'Aquarius',hi:'कुम्भ',lord:'Saturn',elem:'Air',quality:'Fixed'},
    {en:'Pisces',hi:'मीन',lord:'Jupiter',elem:'Water',quality:'Mutable'}
  ];

  const NAKSHATRAS = [
    {en:'Ashwini',hi:'अश्विनी',lord:'Ketu',varna:3},{en:'Bharani',hi:'भरणी',lord:'Venus',varna:0},{en:'Krittika',hi:'कृत्तिका',lord:'Sun',varna:2},
    {en:'Rohini',hi:'रोहिणी',lord:'Moon',varna:1},{en:'Mrigashira',hi:'मृगशिरा',lord:'Mars',varna:3},{en:'Ardra',hi:'आर्द्रा',lord:'Rahu',varna:0},
    {en:'Punarvasu',hi:'पुनर्वसु',lord:'Jupiter',varna:2},{en:'Pushya',hi:'पुष्य',lord:'Saturn',varna:1},{en:'Ashlesha',hi:'आश्लेषा',lord:'Mercury',varna:3},
    {en:'Magha',hi:'मघा',lord:'Ketu',varna:0},{en:'Purva Phalguni',hi:'पूर्व फाल्गुनी',lord:'Venus',varna:2},{en:'Uttara Phalguni',hi:'उत्तर फाल्गुनी',lord:'Sun',varna:1},
    {en:'Hasta',hi:'हस्त',lord:'Moon',varna:3},{en:'Chitra',hi:'चित्रा',lord:'Mars',varna:0},{en:'Swati',hi:'स्वाती',lord:'Rahu',varna:2},
    {en:'Vishakha',hi:'विशाखा',lord:'Jupiter',varna:1},{en:'Anuradha',hi:'अनुराधा',lord:'Saturn',varna:3},{en:'Jyeshtha',hi:'ज्येष्ठा',lord:'Mercury',varna:0},
    {en:'Mula',hi:'मूल',lord:'Ketu',varna:2},{en:'Purva Ashadha',hi:'पूर्व आषाढ़ा',lord:'Venus',varna:1},{en:'Uttara Ashadha',hi:'उत्तर आषाढ़ा',lord:'Sun',varna:3},
    {en:'Shravana',hi:'श्रवण',lord:'Moon',varna:0},{en:'Dhanishtha',hi:'धनिष्ठा',lord:'Mars',varna:2},{en:'Shatabhisha',hi:'शतभिषा',lord:'Rahu',varna:1},
    {en:'Purva Bhadrapada',hi:'पूर्व भाद्रपदा',lord:'Jupiter',varna:3},{en:'Uttara Bhadrapada',hi:'उत्तर भाद्रपदा',lord:'Saturn',varna:0},{en:'Revati',hi:'रेवती',lord:'Mercury',varna:2}
  ];

  const PLANET_COLORS = {Sun:'#F59E0B',Moon:'#94A3B8',Mars:'#EF4444',Mercury:'#10B981',Jupiter:'#F97316',Venus:'#EC4899',Saturn:'#6366F1',Rahu:'#8B5CF6',Ketu:'#14B8A6',Ascendant:'#FBBF24'};
  const PLANET_SYMBOLS = {Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke',Ascendant:'As'};

  return { jd, jdToDate, norm, ayanamsa, calcChart, sunriseSunset, moonriseMoonset, tithi, nakFromLon, yoga, karana, vaar, inauspiciousTimes, abhijitMuhurat, choghadiya, hora, hinduMonth, vikramSamvat, ayana, ritu, moonPhase, calcDasha, detectYogas, sadeSati, dailyRashifal, kundaliMilan, numerology, RASHIS, NAKSHATRAS, PLANET_COLORS, PLANET_SYMBOLS, DASHA_ORDER, DASHA_YRS, RASHI_LUCKY };
})();
