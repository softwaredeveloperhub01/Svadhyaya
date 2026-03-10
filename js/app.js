'use strict';
/* ═══════════════════════════════════════════════════════
   Svādhyāya — Main Application Controller
   Pure HTML5/CSS3/JS — No frameworks, No server
═══════════════════════════════════════════════════════ */

const App = (() => {
  let S = { // State
    profile: null, chart: null, chartStyle: 'north', lang: 'en',
    tab: 'chart', panchangDate: new Date(), calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(), tempUnit: 'C', gitaIdx: 0,
    deferredInstall: null
  };

  const PC = VedicEngine.PLANET_COLORS;
  const E = VedicEngine;
  const PLANET_LIST = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu','Ascendant'];

  // ── Storage ────────────────────────────────────────────────────────────────
  function save(key, val) { try { localStorage.setItem('sv_' + key, JSON.stringify(val)); } catch(e){} }
  function load(key) { try { const v = localStorage.getItem('sv_' + key); return v ? JSON.parse(v) : null; } catch(e){ return null; } }
  function clearAllData() { Object.keys(localStorage).filter(k => k.startsWith('sv_')).forEach(k => localStorage.removeItem(k)); S.profile = null; S.chart = null; showSection('sec-landing'); }

  // ── Section Control ────────────────────────────────────────────────────────
  function showSection(id) {
    document.querySelectorAll('.app-sec').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  }
  window.showSection = showSection;

  // ── Tab Control ────────────────────────────────────────────────────────────
  function switchTab(tab) {
    S.tab = tab;
    document.querySelectorAll('.mnb').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const btn = document.getElementById('mn-' + tab), panel = document.getElementById('tp-' + tab);
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
    // Lazy render
    if (tab === 'vibe') renderVibe();
    if (tab === 'dasha') renderDasha();
    if (tab === 'panchang') renderPanchang();
    if (tab === 'transits') renderTransits();
    if (tab === 'calendar') renderCalendar();
    if (tab === 'muhurat') renderMuhurat();
    if (tab === 'evidence') renderEvidence();
    if (tab === 'numerology') renderNumerology();
    if (tab === 'remedies') renderRemedies();
    if (tab === 'gita') renderGita();
  }
  window.switchTab = switchTab;

  // ── Theme ──────────────────────────────────────────────────────────────────
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.getElementById('themeToggle').textContent = next === 'dark' ? '🌙' : '☀️';
    save('theme', next);
  }
  window.toggleTheme = toggleTheme;

  // ── Settings ───────────────────────────────────────────────────────────────
  function openSettings() { document.getElementById('settingsOverlay').classList.add('open'); }
  function closeSettings() { document.getElementById('settingsOverlay').classList.remove('open'); }
  function setLang(l) { S.lang = l; save('lang', l); document.querySelectorAll('[data-val]').forEach(b => { if (['en','hi'].includes(b.getAttribute('data-val'))) b.classList.toggle('active', b.getAttribute('data-val') === l); }); }
  function setChartStyle(s) { S.chartStyle = s; save('chartStyle', s); document.querySelectorAll('.csb,[data-val="north"],[data-val="south"]').forEach(b => { b.classList.remove('active'); }); const btn1 = document.getElementById('cs-' + s); if (btn1) btn1.classList.add('active'); renderChart(); }
  function setTempUnit(u) { S.tempUnit = u; save('tempUnit', u); }
  function installPWA() { if (S.deferredInstall) { S.deferredInstall.prompt(); } else { alert('To install: use your browser\'s "Add to Home Screen" option.'); } }
  window.closeSettings = closeSettings; window.setLang = setLang; window.setChartStyle = setChartStyle; window.setTempUnit = setTempUnit; window.installPWA = installPWA;

  // ── City Geocoding ─────────────────────────────────────────────────────────
  async function lookupCity() {
    const city = document.getElementById('fPlace').value;
    if (!city) return;
    const btn = document.querySelector('.city-btn');
    btn.textContent = '⏳ Searching...';
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
      const d = await r.json();
      if (d && d[0]) {
        document.getElementById('fLat').value = parseFloat(d[0].lat).toFixed(4);
        document.getElementById('fLon').value = parseFloat(d[0].lon).toFixed(4);
        document.getElementById('fUTC').value = Math.round(parseFloat(d[0].lon) / 15 * 2) / 2;
        btn.textContent = '✅ Found!';
      } else { btn.textContent = '❌ Not found'; }
    } catch { btn.textContent = '❌ Error'; }
    setTimeout(() => { btn.textContent = '📍 Auto Coordinates'; }, 2000);
  }
  window.lookupCity = lookupCity;

  function preset(lat, lon, utc, place) {
    document.getElementById('fLat').value = lat;
    document.getElementById('fLon').value = lon;
    document.getElementById('fUTC').value = utc;
    document.getElementById('fPlace').value = place;
  }
  window.preset = preset;

  // ── Weather (Open-Meteo — free, no key) ────────────────────────────────────
  async function fetchWeather(lat, lon) {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);
      const d = await r.json();
      if (!d.current_weather) return;
      const cw = d.current_weather;
      const maxT = d.daily?.temperature_2m_max?.[0];
      const minT = d.daily?.temperature_2m_min?.[0];
      const precip = d.hourly?.precipitation_probability?.[new Date().getHours()] || 0;
      const wIcon = cw.weathercode <= 1 ? '☀️' : cw.weathercode <= 3 ? '⛅' : cw.weathercode <= 67 ? '🌧️' : cw.weathercode <= 77 ? '❄️' : '⛈️';
      const unit = S.tempUnit === 'F' ? 'F' : 'C';
      const toF = c => Math.round(c * 9 / 5 + 32);
      const temp = unit === 'F' ? toF(cw.temperature) : Math.round(cw.temperature);
      const hi = unit === 'F' ? toF(maxT) : Math.round(maxT);
      const lo = unit === 'F' ? toF(minT) : Math.round(minT);
      const wEl = document.getElementById('weatherWidget');
      if (wEl) wEl.innerHTML = `<div style="text-align:right">${wIcon} <strong>${temp}°${unit}</strong> · H:${hi}° L:${lo}°<br><span style="font-size:11px;color:var(--text3)">${precip}% rain chance · Weather, Not Fate 🌦️</span></div>`;
    } catch(e) {}
  }

  // ── Day/Night Badge ────────────────────────────────────────────────────────
  function updateDayNight() {
    if (!S.profile) return;
    const now = new Date();
    const ss = E.sunriseSunset(now.getFullYear(), now.getMonth()+1, now.getDate(), S.profile.lat, S.profile.lon, S.profile.tz);
    const nowH = now.getHours() + now.getMinutes() / 60;
    const el = document.getElementById('dayNightBadge');
    if (!el || !ss.riseH) return;
    const isDay = nowH >= ss.riseH && nowH < ss.setH;
    el.innerHTML = isDay ? `<span style="background:rgba(245,158,11,.15);border:1px solid var(--gold3);border-radius:12px;padding:4px 10px;font-size:12px;color:var(--gold)">☀️ Day</span>` : `<span style="background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:4px 10px;font-size:12px;color:#818CF8">🌙 Night</span>`;
  }

  // ── Generate Chart ────────────────────────────────────────────────────────
  function handleForm(e) {
    e.preventDefault();
    const profile = {
      name: document.getElementById('fName').value || 'You',
      day: +document.getElementById('fDay').value,
      month: +document.getElementById('fMonth').value,
      year: +document.getElementById('fYear').value,
      hour: +document.getElementById('fHour').value,
      min: +document.getElementById('fMin').value,
      lat: +document.getElementById('fLat').value,
      lon: +document.getElementById('fLon').value,
      tz: +document.getElementById('fUTC').value,
      place: document.getElementById('fPlace').value || ''
    };
    if (!profile.year || !profile.month || !profile.day || !profile.lat || !profile.lon) {
      alert('Please fill in all required fields (date, time, coordinates).'); return;
    }
    try {
      S.chart = E.calcChart(profile.year, profile.month, profile.day, profile.hour, profile.min, profile.lat, profile.lon, profile.tz);
      S.profile = profile;
      save('profile', profile);
      showSection('sec-main');
      updateHeader();
      renderChart();
      renderPlanetTable();
      updateDayNight();
      fetchWeather(profile.lat, profile.lon);
    } catch(err) { console.error(err); alert('Error calculating chart. Please check your inputs.'); }
  }

  function updateHeader() {
    const p = S.profile;
    const el = document.getElementById('hdrName');
    const de = document.getElementById('hdrDate');
    if (el) el.textContent = p.name;
    if (de) de.textContent = `${p.day}/${p.month}/${p.year} · ${p.place || ''}`;
  }

  // ── Chart Render ──────────────────────────────────────────────────────────
  function renderChart() {
    if (!S.chart) return;
    const el = document.getElementById('chartSVG');
    if (!el) return;
    const size = Math.min(el.offsetWidth || 380, 420);
    el.innerHTML = S.chartStyle === 'south'
      ? ChartRenderer.southIndian(S.chart.planets, size)
      : ChartRenderer.northIndian(S.chart.planets, size);
    renderYogas();
  }

  function renderYogas() {
    if (!S.chart) return;
    const yogas = E.detectYogas(S.chart.planets);
    const el = document.getElementById('yogaPanel');
    if (!el) return;
    if (!yogas.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);font-family:sans-serif;margin-bottom:6px">Yogas Detected</div>` +
      yogas.map(y => `<div class="yoga-card ${y.quality}"><div class="yoga-name">${y.name}</div><div>${y.desc}</div></div>`).join('');
  }

  // ── Planet Table ──────────────────────────────────────────────────────────
  function renderPlanetTable() {
    if (!S.chart) return;
    const el = document.getElementById('planetTable');
    if (!el) return;
    const rows = PLANET_LIST.map(name => {
      const d = S.chart.planets[name];
      if (!d) return '';
      const c = PC[name] || '#94A3B8';
      return `
        <tr class="pr">
          <td><span style="color:${c};font-weight:700;font-size:13px">${name}</span></td>
          <td><span class="rn">${d.rashi.en}</span><span class="rh">${d.rashi.hi}</span></td>
          <td class="deg-c">${parseFloat(d.degInRashi).toFixed(2)}°</td>
          <td style="font-size:12px;color:var(--text2)">${d.nak.en}</td>
          <td style="font-size:12px;color:var(--text3);text-align:center">${d.pada}</td>
          <td><button class="why-b" onclick="toggleWhy('${name}')">?</button></td>
        </tr>
        <tr class="why-row" id="why-row-${name}" style="display:none">
          <td class="why-td" colspan="6" id="why-td-${name}"></td>
        </tr>`;
    }).join('');
    el.innerHTML = `<table class="ptbl"><thead><tr><th>Planet</th><th>Rashi</th><th>Deg</th><th>Nakshatra</th><th>Pada</th><th>Why?</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function toggleWhy(name) {
    const row = document.getElementById('why-row-' + name);
    const td = document.getElementById('why-td-' + name);
    if (!row) return;
    const open = row.style.display !== 'none';
    row.style.display = open ? 'none' : 'table-row';
    if (!open && td && !td.dataset.loaded) {
      td.innerHTML = buildWhyPanel(name);
      td.dataset.loaded = '1';
    }
  }
  window.toggleWhy = toggleWhy;

  function buildWhyPanel(name) {
    const d = S.chart.planets[name];
    if (!d) return '';
    const signName = d.rashi.en;
    const nakName = d.nak.en;
    const pInterp = Interp.planetSign[name] ? Interp.planetSign[name][signName] : null;
    const nInterp = Interp.nakshatra[nakName] || '';
    return `<div class="why-panel">
      <div class="why-hdr">📖 ${name} in ${signName} (${d.rashi.hi})</div>
      ${pInterp ? `<div class="why-sec"><div class="why-lbl">Planetary Energy</div><div class="why-txt">${pInterp}</div></div>` : ''}
      ${nInterp ? `<div class="why-sec" style="border-left-color:rgba(139,92,246,.4)"><div class="why-lbl">Nakshatra: ${nakName}</div><div class="why-txt">${nInterp}</div></div>` : ''}
      <div class="why-sci"><div class="why-lbl">🔬 The Astronomy</div><div class="why-txt">${name} is at ${d.lon.toFixed(4)}° sidereal (Lahiri Ayanamsa: ${S.chart.ayanamsa.toFixed(4)}°). Rashi ${signName} occupies ${Math.floor(d.lon/30)*30}°–${Math.floor(d.lon/30)*30+30}° of the ecliptic. Nakshatra ${nakName}, Pada ${d.pada}.</div></div>
    </div>`;
  }

  // ── Panchang ──────────────────────────────────────────────────────────────
  function renderPanchang() {
    const dt = S.panchangDate;
    const yr = dt.getFullYear(), mo = dt.getMonth()+1, dy = dt.getDate();
    const p = S.profile || { lat: 19.076, lon: 72.877, tz: 5.5 };
    const jd = E.jd(yr, mo, dy, 6, 0, 0, p.tz);
    const ay = E.ayanamsa(jd);
    const sunL = E.norm(E.calcChart(yr,mo,dy,6,0,p.lat,p.lon,p.tz).planets.Sun.lon + ay) - ay;
    const moonL_v = E.calcChart(yr,mo,dy,6,0,p.lat,p.lon,p.tz).planets.Moon.lon;
    const sunL_v = E.calcChart(yr,mo,dy,6,0,p.lat,p.lon,p.tz).planets.Sun.lon;
    const sunrise = E.sunriseSunset(yr,mo,dy,p.lat,p.lon,p.tz);
    const moonrise = E.moonriseMoonset(yr,mo,dy,p.lat,p.lon,p.tz);
    const tithiData = E.tithi(sunL_v + ay, moonL_v + ay);
    const nakData = E.nakFromLon(moonL_v);
    const yogaData = E.yoga(sunL_v, moonL_v);
    const karanaData = E.karana(sunL_v, moonL_v);
    const vaarData = E.vaar(jd);
    const moonPhaseData = E.moonPhase(sunL_v, moonL_v);
    const hindMon = E.hinduMonth(sunL_v);
    const samvat = E.vikramSamvat(yr, mo);
    const ayanaData = E.ayana(sunL_v + ay);
    const rituData = E.ritu(sunL_v + ay);
    document.getElementById('panchangDateLabel').textContent = dt.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

    const pcards = [
      {icon:'🌙',label:'Tithi',val:`${tithiData.number}. ${tithiData.name}`,sub:`${tithiData.paksha} Paksha · ${tithiData.percent}% elapsed`},
      {icon:'⭐',label:'Nakshatra',val:nakData.en,sub:`${nakData.hi} · Pada ${nakData.pada} · Lord: ${nakData.lord}`},
      {icon:'🔗',label:'Yoga',val:yogaData.name,sub:`Yoga ${yogaData.index} of 27`},
      {icon:'🌓',label:'Karana',val:karanaData.name,sub:'Half-Tithi period'},
      {icon:'📅',label:'Vaar',val:vaarData.en,sub:vaarData.hi},
      {icon:'🌒',label:'Paksha',val:tithiData.paksha,sub:tithiData.paksha==='Shukla'?'Bright fortnight (Waxing)':'Dark fortnight (Waning)'},
      {icon:'📿',label:'Maas (Month)',val:hindMon,sub:'Hindu lunar month'},
      {icon:'🕉️',label:'Vikram Samvat',val:String(samvat),sub:`CE ${yr}`},
      {icon:'🌍',label:'Moon Rashi',val:E.RASHIS[Math.floor(moonL_v/30)%12].en,sub:E.RASHIS[Math.floor(moonL_v/30)%12].hi},
      {icon:moonPhaseData.emoji,label:'Moon Phase',val:moonPhaseData.name,sub:`${moonPhaseData.illumination}% illuminated`},
      {icon:'🌄',label:'Ayana',val:ayanaData.split(' ')[0],sub:ayanaData},
      {icon:'🌸',label:'Ritu (Season)',val:rituData,sub:'Indian seasonal cycle'}
    ];
    document.getElementById('panchangGrid').innerHTML = pcards.map(c=>`<div class="pcard"><div class="pc-icon">${c.icon}</div><div class="pc-label">${c.label}</div><div class="pc-val">${c.val}</div><div class="pc-sub">${c.sub}</div></div>`).join('');

    document.getElementById('panchangTimings').innerHTML = [
      {label:'🌅 Sunrise',val:sunrise.sunrise||'N/A'},
      {label:'🌇 Sunset',val:sunrise.sunset||'N/A'},
      {label:'🌙 Moonrise',val:moonrise.moonrise},
      {label:'🌛 Moonset',val:moonrise.moonset},
    ].map(t=>`<div class="timing-row"><span class="tr-label">${t.label}</span><span class="tr-val">${t.val}</span></div>`).join('');

    if (sunrise.riseH && sunrise.setH) {
      const iau = E.inauspiciousTimes(sunrise.riseH, sunrise.setH, vaarData.en);
      const abh = E.abhijitMuhurat(sunrise.riseH, sunrise.setH);
      document.getElementById('panchangInauspicious').innerHTML = `
        <div class="inauspicious-row"><span class="inaus-name">⛔ Rahu Kaal</span><span class="inaus-time">${iau.rahuKaal.start} – ${iau.rahuKaal.end}</span></div>
        <div class="inauspicious-row"><span class="inaus-name">⚠️ Gulika Kaal</span><span class="inaus-time">${iau.gulikaKaal.start} – ${iau.gulikaKaal.end}</span></div>
        <div class="inauspicious-row"><span class="inaus-name">⚠️ Yamagandam</span><span class="inaus-time">${iau.yamagandam.start} – ${iau.yamagandam.end}</span></div>
        <div class="inauspicious-row" style="border-left:2px solid var(--green)"><span style="color:var(--green)">✨ Abhijit Muhurat</span><span class="inaus-time">${abh.start} – ${abh.end}</span></div>`;
      const chog = E.choghadiya(sunrise.riseH, sunrise.setH, vaarData.en);
      document.getElementById('choghadiyaDay').innerHTML = chog.map(c=>`<div class="chog-cell"><div class="chog-name">${c.name}</div><div class="chog-quality">${c.quality}</div><div class="chog-time">${c.start}–${c.end}</div></div>`).join('');
      const hora = E.hora(sunrise.riseH, sunrise.setH, vaarData.en);
      document.getElementById('horaDay').innerHTML = hora.map(h=>`<div class="hora-cell"><div class="hora-lord" style="color:${PC[h.lord]||'#94A3B8'}">${h.lord}</div><div class="hora-time">${h.start}</div></div>`).join('');
    }
  }
  window.changePanchangDate = (d) => { S.panchangDate.setDate(S.panchangDate.getDate()+d); renderPanchang(); };
  window.setPanchangToday = () => { S.panchangDate = new Date(); renderPanchang(); };

  // ── Today's Vibe ──────────────────────────────────────────────────────────
  function renderVibe() {
    if (!S.chart) return;
    const now = new Date();
    const p = S.profile;
    const todayChart = E.calcChart(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getHours(),now.getMinutes(),p.lat,p.lon,p.tz);
    const todayMoon = todayChart.planets.Moon;
    const todaySun = todayChart.planets.Sun;
    const moonSignName = todayMoon.rashi.en;
    const moonVibe = Interp.moonVibe[moonSignName] || {};
    const moonPhaseData = E.moonPhase(todaySun.lon, todayMoon.lon);
    const moonNak = todayMoon.nak;
    const rfl = E.dailyRashifal(S.chart.planets.Moon.rashiIdx, todayMoon.rashiIdx);
    const lky = E.RASHI_LUCKY[S.chart.planets.Moon.rashiIdx] || {};
    const ss = E.sadeSati(S.chart.planets.Moon.rashiIdx, todayChart.planets.Saturn.lon);

    document.getElementById('vibeMain').innerHTML = `
      <div class="vibe-hero">
        <div class="vibe-date">${now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        <div class="vibe-moon-row">
          <span class="vibe-emoji">${moonVibe.emoji||'🌙'}</span>
          <div>
            <div class="vibe-moon-sign">Moon in <strong>${moonSignName}</strong> (${todayMoon.rashi.hi})</div>
            <div class="vibe-nak">Nakshatra: ${moonNak.en} · ${moonNak.hi} · ${moonPhaseData.emoji} ${moonPhaseData.name} (${moonPhaseData.illumination}% illuminated)</div>
          </div>
        </div>
        <div class="vibe-badge">${moonVibe.vibe||''}</div>
        <div class="vibe-forecast">${moonVibe.forecast||''}</div>
        <div class="vibe-row">
          <div class="vibe-block vibe-good"><div class="vibe-block-title">✨ Best For</div>${moonVibe.good||''}</div>
          <div class="vibe-block vibe-mindful"><div class="vibe-block-title">🌙 Be Mindful Of</div>${moonVibe.avoid||''}</div>
        </div>
      </div>`;

    document.getElementById('rashifalPanel').innerHTML = `
      <h3 class="section-h3">🔮 Today's Rashifal</h3>
      <div class="day-score-band">
        <div class="day-score-card" style="border-color:${rfl.color}40;background:${rfl.color}08">
          <div class="dsc-label">Day Quality</div>
          <div class="dsc-score" style="color:${rfl.color}">${rfl.score}/10</div>
          <div class="dsc-type" style="color:${rfl.color}">${rfl.dayType}</div>
        </div>
        <div class="day-score-card" style="border-color:var(--borderS);flex:2">
          <div class="dsc-label" style="margin-bottom:8px">Planetary Atmosphere Today</div>
          <div style="font-size:14px;color:var(--text2);line-height:1.7;text-align:left;font-style:italic">
            ${rfl.dayType === 'Excellent' ? 'The current Moon-natal Moon relationship is highly harmonious — energy flows freely. An excellent day for important decisions and new ventures.' : rfl.dayType === 'Good' ? 'A generally supportive day. Current planetary energies are in alignment with your birth configuration. Good for steady progress.' : 'Current transits create some friction with your natal Moon. Use this energy for introspection and patience rather than pushing against resistance.'}
          </div>
        </div>
      </div>`;

    document.getElementById('luckyPanel').innerHTML = `
      <h3 class="section-h3">🍀 Your Lucky Correspondences</h3>
      <div class="lucky-grid">
        <div class="lucky-card"><div class="lc-icon">🎨</div><div class="lc-label">Lucky Color</div><div class="lc-val">${lky.color||'—'}</div></div>
        <div class="lucky-card"><div class="lc-icon">🔢</div><div class="lc-label">Lucky Number</div><div class="lc-val">${lky.num||'—'}</div></div>
        <div class="lucky-card"><div class="lc-icon">💎</div><div class="lc-label">Power Gem</div><div class="lc-val">${lky.gem||'—'}</div></div>
        <div class="lucky-card"><div class="lc-icon">📅</div><div class="lc-label">Best Day</div><div class="lc-val">${lky.day||'—'}</div></div>
      </div>`;

    document.getElementById('sadeSatiPanel').innerHTML = ss.active ? `
      <div style="background:rgba(245,158,11,.08);border:1px solid var(--gold3);border-radius:var(--rs);padding:16px;margin-bottom:20px">
        <strong style="color:var(--gold)">⚠️ Sade Sati — ${ss.phase} Phase</strong>
        <p style="font-size:14px;color:var(--text2);margin-top:6px;line-height:1.7">${ss.desc}</p>
        <p style="font-size:13px;color:var(--text3);margin-top:6px;font-style:italic">Strategy: Focus on discipline, patience, and long-term building. This is Saturn's gift — the refinement of what truly matters.</p>
      </div>` : '';

    renderTransitInsights(todayChart);
  }

  function renderTransitInsights(todayChart) {
    if (!S.chart) return;
    const el = document.getElementById('transitInsightsPanel');
    if (!el) return;
    const insights = [];
    const checkPlanets = ['Saturn', 'Jupiter', 'Rahu', 'Mars'];
    checkPlanets.forEach(planet => {
      const natalSign = S.chart.planets[planet]?.rashiIdx;
      const transitSign = todayChart.planets[planet]?.rashiIdx;
      if (natalSign === undefined || transitSign === undefined) return;
      const diff = Math.abs(transitSign - natalSign);
      const house = (transitSign - S.chart.planets.Ascendant.rashiIdx + 12) % 12 + 1;
      insights.push({ planet, house, sign: E.RASHIS[transitSign].en, insight: buildTransitInsight(planet, house) });
    });
    el.innerHTML = `<h3 class="section-h3" style="margin-top:0">🌍 Current Transits &amp; Their Effect on You</h3>` +
      insights.map(i=>`<div class="ti-card"><div class="ti-planet" style="color:${PC[i.planet]}">${i.planet} currently in ${i.sign} (House ${i.house})</div><div class="ti-insight">${i.insight}</div></div>`).join('');
  }

  function buildTransitInsight(planet, house) {
    const H = {
      Saturn: {1:'Saturn transiting your Ascendant sign — a period of self-evaluation, restructuring personal identity and direction.',2:'Saturn in 2nd house — themes of financial discipline, savings, and family structures come to the foreground.',4:'Saturn in 4th — home, property, and inner security are being refined.',7:'Saturn in 7th — partnerships face tests and strengthening simultaneously.',10:'Saturn in 10th — career and public life require disciplined, sustained effort.'},
      Jupiter: {1:'Jupiter expanding through your Ascendant — opportunities for personal growth, optimism, and new beginnings.',5:'Jupiter in 5th — creativity, education, and self-expression receive a generous expansion.',9:'Jupiter in 9th — philosophy, spirituality, and long-distance horizons open up.',11:'Jupiter in 11th — networks, gains, and aspirations receive a beneficial boost.'},
      Rahu: {1:'Rahu\'s ambition intensifies personal identity — new, sometimes unusual directions emerge.',7:'Rahu in 7th — unusual partnerships or foreign connections become significant.',10:'Rahu in career house — unconventional paths and ambitious growth in public life.'},
      Mars: {1:'Mars energizing your Ascendant — higher physical energy and drive. Channel into exercise and initiative.',3:'Mars in 3rd — strong communication energy. Great for writing, speaking, and courageous actions.',10:'Mars in career zone — professional drive is high. Act boldly but thoughtfully.'}
    };
    return (H[planet] && H[planet][house]) || `${planet} is in house ${house}, influencing the themes of that area of life — relationships, resources, work — with its characteristic energy.`;
  }

  // ── Dasha ─────────────────────────────────────────────────────────────────
  function renderDasha() {
    if (!S.chart || !S.profile) return;
    const birthDate = new Date(S.profile.year, S.profile.month-1, S.profile.day);
    const { dashas, nakshatra } = E.calcDasha(S.chart.planets.Moon.lon, birthDate);
    const today = new Date();

    // Timeline bar
    const totalMs = 120 * 365.25 * 24 * 3600 * 1000;
    const startMs = birthDate.getTime();
    const tl = document.getElementById('dashaTimeline');
    const barSegs = dashas.map(d => {
      const w = (d.years / 120 * 100).toFixed(1);
      const c = PC[d.lord] || '#94A3B8';
      const isCur = d.start <= today && d.end > today;
      return `<div class="dtl-seg" style="width:${w}%;background:${c};opacity:${isCur?1:0.5}" title="${d.lord}: ${d.start.getFullYear()}–${d.end.getFullYear()}">${parseFloat(w) > 8 ? d.lord : ''}</div>`;
    }).join('');
    tl.innerHTML = `<div style="font-size:12px;font-family:sans-serif;color:var(--text3);margin-bottom:6px">Moon Nakshatra: <strong style="color:var(--gold)">${nakshatra.en}</strong> · Lord: <strong style="color:${PC[nakshatra.lord]}">${nakshatra.lord}</strong></div><div class="dtl-bar">${barSegs}</div>`;

    const cards = document.getElementById('dashaCards');
    const now = today;
    let rendered = '';
    dashas.forEach(d => {
      const isCur = d.start <= now && d.end > now;
      const isPast = d.end <= now;
      const interp = Interp.dasha[d.lord] || {};
      const c = PC[d.lord] || '#94A3B8';
      const sy = d.start.getFullYear(), ey = d.end.getFullYear();
      rendered += `<div class="dasha-card${isCur?' cur':''}${isPast?' past':''}">
        <div class="dasha-head">
          <span class="dasha-lord-pill" style="color:${c};border-color:${c}40">${d.lord} Dasha ${isCur?'← Now':''}</span>
          <span class="dasha-dates">${sy} → ${ey} · ${d.years}yr</span>
        </div>
        ${interp.theme?`<div class="dasha-theme">${interp.theme}</div>`:''}
        ${interp.summary?`<div class="dasha-sum">${interp.summary}</div>`:''}
        ${isCur && interp.strategy?`<div class="dasha-strat">🌱 Strategy: ${interp.strategy}</div>`:''}
      </div>`;
    });
    cards.innerHTML = rendered;
  }

  // ── Transits Tab ──────────────────────────────────────────────────────────
  function renderTransits() {
    const now = new Date();
    const lat = S.profile?.lat || 19.076, lon = S.profile?.lon || 72.877, tz = S.profile?.tz || 5.5;
    const tc = E.calcChart(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getHours(),now.getMinutes(),lat,lon,tz);
    const el = document.getElementById('transitTable');
    const rows = PLANET_LIST.map(name => {
      const d = tc.planets[name];
      if (!d) return '';
      const c = PC[name] || '#94A3B8';
      return `<tr><td><span style="color:${c};font-weight:700">${name}</span></td><td><span style="color:var(--text1)">${d.rashi.en}</span> <span style="color:var(--text3);font-family:var(--deva);font-size:12px">${d.rashi.hi}</span></td><td class="deg-c">${d.lon.toFixed(3)}°</td><td style="font-size:12px;color:var(--text2)">${d.nak.en}</td><td style="font-size:11px;color:var(--text3)">${d.rashi.lord}</td></tr>`;
    }).join('');
    el.innerHTML = `<p style="font-size:12px;color:var(--text3);font-family:sans-serif;margin-bottom:10px">Live positions · ${now.toLocaleTimeString('en-IN')} · Ayanamsa: ${tc.ayanamsa.toFixed(4)}°</p><table class="ttbl"><thead><tr><th>Planet</th><th>Rashi</th><th>Longitude</th><th>Nakshatra</th><th>Sign Lord</th></tr></thead><tbody>${rows}</tbody></table>`;
    if (S.chart) renderTransitInsights(tc);
  }

  // ── Calendar ──────────────────────────────────────────────────────────────
  function renderCalendar() {
    const yr = S.calYear, mo = S.calMonth;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('calMonthLabel').textContent = `${monthNames[mo]} ${yr}`;
    const first = new Date(yr, mo, 1).getDay();
    const days = new Date(yr, mo+1, 0).getDate();
    const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < first; i++) html += `<div class="cal-day empty"></div>`;
    const today = new Date();
    const lat = S.profile?.lat||19.076, lon = S.profile?.lon||72.877, tz = S.profile?.tz||5.5;
    for (let d = 1; d <= days; d++) {
      const isToday = d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear();
      const tc = E.calcChart(yr,mo+1,d,12,0,lat,lon,tz);
      const tData = E.tithi(tc.planets.Sun.lon, tc.planets.Moon.lon);
      const moonPhase = E.moonPhase(tc.planets.Sun.lon, tc.planets.Moon.lon);
      const dateStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const fest = Interp.festivals.find(f=>f.date===dateStr);
      html += `<div class="cal-day${isToday?' today':''}">
        <div class="cal-day-num">${d}</div>
        <div class="cal-tithi">${tData.number}.${tData.name.substring(0,4)}</div>
        ${fest?`<div class="cal-fest-dot ${fest.type}"></div>`:''}
        <div class="cal-moon">${moonPhase.emoji}</div>
      </div>`;
    }
    document.getElementById('calGrid').innerHTML = html;
    const monthFests = Interp.festivals.filter(f=>f.date.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`));
    document.getElementById('calFestList').innerHTML = monthFests.length ? `<h3 class="section-h3">🪔 Festivals &amp; Vrats this Month</h3>` + monthFests.map(f=>`<div class="cal-fest-item"><span class="cfi-date">${f.date.slice(8)}</span><span class="cfi-name">${f.name}</span><span class="cfi-type ${f.type}">${f.type}</span></div>`).join('') : '';
  }
  window.changeCalMonth = (d) => { S.calMonth+=d; if(S.calMonth>11){S.calMonth=0;S.calYear++;}if(S.calMonth<0){S.calMonth=11;S.calYear--;} renderCalendar(); };

  // ── Muhurat ───────────────────────────────────────────────────────────────
  function renderMuhurat() {
    const now = new Date();
    const p = S.profile || { lat:19.076, lon:72.877, tz:5.5 };
    const sunrise = E.sunriseSunset(now.getFullYear(),now.getMonth()+1,now.getDate(),p.lat,p.lon,p.tz);
    const tc = E.calcChart(now.getFullYear(),now.getMonth()+1,now.getDate(),12,0,p.lat,p.lon,p.tz);
    const tData = E.tithi(tc.planets.Sun.lon, tc.planets.Moon.lon);
    const vaarData = E.vaar(E.jd(now.getFullYear(),now.getMonth()+1,now.getDate()));
    const abh = sunrise.riseH && sunrise.setH ? E.abhijitMuhurat(sunrise.riseH, sunrise.setH) : null;
    const chog = sunrise.riseH && sunrise.setH ? E.choghadiya(sunrise.riseH, sunrise.setH, vaarData.en) : [];
    const auspChog = chog.filter(c=>['Amrit','Shubh','Labh'].includes(c.name));

    document.getElementById('muhuratGrid').innerHTML = [
      abh ? { name:'✨ Abhijit Muhurat', time:`${abh.start} – ${abh.end}`, desc:'The most auspicious time each day, around solar noon. Excellent for starting any important work.' } : null,
      ...auspChog.map(c=>({ name:`${c.name} Choghadiya`, time:`${c.start} – ${c.end}`, desc:c.quality }))
    ].filter(Boolean).map(m=>`<div class="mcard"><div class="mcard-name">${m.name}</div><div class="mcard-time">${m.time}</div><div class="mcard-desc">${m.desc}</div></div>`).join('');

    const activities = [
      {icon:'💒',name:'Marriage',status:'Check nakshatra & tithi'},
      {icon:'🏠',name:'Griha Pravesh',status:'Avoid Rahu Kaal'},
      {icon:'🚗',name:'Vehicle Purchase',status:'Pushya or Rohini Nakshatra'},
      {icon:'💼',name:'Business Start',status:'Shukla Paksha preferred'},
      {icon:'✈️',name:'Travel',status:'Avoid 8th tithi if possible'},
      {icon:'📚',name:'Vidyarambha',status:'Pushya Nakshatra ideal'}
    ];
    document.getElementById('muhuratActivity').innerHTML = activities.map(a=>`<div class="ma-card"><div class="ma-icon">${a.icon}</div><div class="ma-name">${a.name}</div><div class="ma-status">${a.status}</div></div>`).join('');
  }

  // ── Evidence Vault ─────────────────────────────────────────────────────────
  function renderEvidence() {
    const events = [
      { year:'2020', title:'Saturn enters Capricorn — The Global Restructuring', q:'Was 2020 a year of profound restriction, discipline, and life restructuring?', exp:'Saturn moved into Capricorn in early 2020, its own sign of maximum authority, creating a rare planetary concentration. This is verifiable astronomy — Saturn was at ~270° sidereal longitude. This configuration historically correlates with periods demanding patience, structural change, and long-term rebuilding.' },
      { year:'2022', title:'Jupiter in Pisces — Spiritual Expansion', q:'Did 2022 feel spiritually expansive, compassionate, or creatively rich for you?', exp:'Jupiter transited Pisces in 2022, its sign of exaltation. Jupiter at ~330° sidereal. This is one of the most observed benefic transits — many people report a 12-13 month window of optimism, creative breakthroughs, or spiritual openings.' },
      { year:'2023', title:'Saturn enters Aquarius', q:'Since early 2023, have you felt pressure around systems, community, technology, or collective responsibilities?', exp:'Saturn moved into Aquarius (sidereal) in early 2023. Saturn governs restructuring; Aquarius governs networks, technology, and collective progress. The combination has been visible across global patterns — tech disruption, AI, community restructuring.' },
      { year:'2024', title:'Jupiter in Taurus — Building Stability', q:'Did mid-2024 bring a feeling of settling, material expansion, or creative groundedness?', exp:'Jupiter moved into Taurus in 2024. Jupiter in earth signs favors tangible growth — property, finances, health, and sensory creativity. Many people report a "settling in" feeling during Jupiter-Taurus transits after a period of Jupiter in restless Aries.' },
      { year:'2019', title:'Rahu in Gemini — Information Overload', q:'Was 2019 a time of communication overwhelm, scattered focus, or dramatic shifts in how you processed information?', exp:'Rahu entered Gemini (sidereal) in 2019. Rahu amplifies and obsesses over its sign\'s themes — in Gemini, this meant information, communication, and mental restlessness. Many people recall this as a period of digital overwhelm or information-driven change.' },
      { year:'2017', title:'Saturn in Sagittarius — Testing Beliefs', q:'Did 2017-2019 challenge your core beliefs, philosophical framework, or long-held assumptions?', exp:'Saturn transited Sagittarius from late 2017. Saturn tests and crystallizes the themes of its sign. In Sagittarius, it tested beliefs, philosophy, education, and travel. Many people report a period of "what do I actually believe?" during this Saturn transit.' }
    ];
    const saved = load('reflections') || {};
    document.getElementById('evidenceList').innerHTML = events.map((ev,i)=>`
      <div class="ev-card" onclick="toggleEvidence(${i},this)">
        <div class="ev-header">
          <span class="ev-year">${ev.year}</span>
          <span class="ev-title">${ev.title}</span>
          <span class="ev-chevron" id="ev-chev-${i}">▼</span>
        </div>
        <div class="ev-q">${ev.q}</div>
        <div class="ev-detail" id="ev-det-${i}">
          <div class="ev-expl">${ev.exp}</div>
          <div class="ev-reflect"><textarea placeholder="Your reflection (saved only in your browser)..." onchange="saveReflection(${i},this.value)">${saved[i]||''}</textarea></div>
        </div>
      </div>`).join('');
  }
  window.toggleEvidence = (i,el) => {
    const det = document.getElementById('ev-det-'+i);
    const chev = document.getElementById('ev-chev-'+i);
    if (!det) return;
    const open = det.style.display !== 'none';
    det.style.display = open ? 'none' : 'block';
    if (chev) chev.textContent = open ? '▼' : '▲';
  };
  window.saveReflection = (i,val) => {
    const r = load('reflections') || {};
    r[i] = val;
    save('reflections', r);
  };

  // ── Numerology ─────────────────────────────────────────────────────────────
  function renderNumerology() {
    if (!S.profile) return;
    const { day, month, year } = S.profile;
    const num = E.numerology(day, month, year);
    const moonRashi = S.chart?.planets.Moon.rashiIdx;
    const sunRashi = S.chart?.planets.Sun.rashiIdx;
    document.getElementById('numerologyPanel').innerHTML = `
      <h3 class="section-h3">🔢 Numerology Profile</h3>
      <div class="num-grid">
        <div class="num-card"><div class="num-label">Life Path Number</div><div class="num-num">${num.lifePath}</div><div class="num-meaning">${num.lifeMeaning}</div></div>
        <div class="num-card"><div class="num-label">Birth Number</div><div class="num-num">${num.birthNum}</div><div class="num-meaning">${num.birthMeaning}</div></div>
        <div class="num-card"><div class="num-label">Name Number</div><div class="num-num">${(num.lifePath + num.birthNum) % 9 || 9}</div><div class="num-meaning">The vibration of your expression and communication style</div></div>
      </div>
      <h3 class="section-h3">🌙 Vedic Correspondences</h3>
      <div style="background:var(--bg1);border:1px solid var(--borderS);border-radius:var(--rs);padding:16px;font-size:14px;line-height:1.8;color:var(--text2)">
        <p>Your Sun is in <strong>${moonRashi !== undefined ? E.RASHIS[sunRashi].en : '—'}</strong> and Moon is in <strong>${moonRashi !== undefined ? E.RASHIS[moonRashi].en : '—'}</strong>.</p>
        <p>In Vedic numerology, the ruling number for your Moon sign (${moonRashi !== undefined ? E.RASHIS[moonRashi].en : '—'}) is <strong>${E.RASHI_LUCKY[moonRashi]?.num || '—'}</strong>.</p>
        <p>This number governs your emotional patterns and instinctual responses.</p>
        <p style="margin-top:10px;font-style:italic;color:var(--text3)">Note: Numerology, like astrology, shows tendencies and patterns — not fixed outcomes. You are always the author of your story.</p>
      </div>`;
  }

  // ── Remedies ──────────────────────────────────────────────────────────────
  function renderRemedies() {
    if (!S.chart) return;
    const remData = [
      { planet:'Sun', gem:'Ruby', metal:'Gold', mantra:'Om Suryaya Namaha', day:'Sunday', color:'Red', fast:'Sunday (optional)', activity:'Offer water to the Sun at sunrise. Meditate on clarity and purpose.' },
      { planet:'Moon', gem:'Pearl / Moonstone', metal:'Silver', mantra:'Om Chandraya Namaha', day:'Monday', color:'White/Silver', fast:'Monday', activity:'Spend time near water. Journaling, meditation, and family nurturing.' },
      { planet:'Mars', gem:'Red Coral', metal:'Copper', mantra:'Om Mangalaya Namaha', day:'Tuesday', color:'Red', fast:'Tuesday', activity:'Physical exercise, martial arts, disciplined action. Channel energy into creation.' },
      { planet:'Mercury', gem:'Emerald / Green Tourmaline', metal:'Mix (Panchadhatu)', mantra:'Om Budhaya Namaha', day:'Wednesday', color:'Green', fast:'Wednesday', activity:'Reading, writing, learning, communication. Study and teach.' },
      { planet:'Jupiter', gem:'Yellow Sapphire / Citrine', metal:'Gold', mantra:'Om Gurave Namaha', day:'Thursday', color:'Yellow', fast:'Thursday', activity:'Teaching, study, charity, spiritual practice. Share your wisdom.' },
      { planet:'Venus', gem:'Diamond / White Sapphire', metal:'Silver', mantra:'Om Shukraya Namaha', day:'Friday', color:'White/Pink', fast:'Friday', activity:'Creative expression, art, music, relationship cultivation, beauty.' },
      { planet:'Saturn', gem:'Blue Sapphire / Amethyst', metal:'Iron/Steel', mantra:'Om Shanaischaraya Namaha', day:'Saturday', color:'Blue/Black', fast:'Saturday', activity:'Service to others, disciplined work, patience practices. Visit the elderly or less fortunate.' },
      { planet:'Rahu', gem:'Hessonite Garnet', metal:'Mix', mantra:'Om Rahave Namaha', day:'Saturday', color:'Dark Blue', fast:'—', activity:'Meditation on clarity and groundedness. Release attachments to outcomes.' },
      { planet:'Ketu', gem:'Cat\'s Eye Chrysoberyl', metal:'Mix', mantra:'Om Ketave Namaha', day:'Tuesday', color:'Grey/Mixed', fast:'—', activity:'Spiritual practice, detachment, introspection. Let go of what no longer serves.' }
    ];
    document.getElementById('remediesPanel').innerHTML = remData.map(r=>`
      <div class="rem-card">
        <div class="rem-planet" style="color:${PC[r.planet]||'#94A3B8'}">${r.planet}</div>
        <div class="rem-gem">💎 Gem: ${r.gem}</div>
        <div class="rem-mantra">🕉️ ${r.mantra}</div>
        <div class="rem-day">📅 ${r.day} · ${r.color}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:6px;font-style:italic;line-height:1.5">${r.activity}</div>
      </div>`).join('');
  }

  // ── Gita ──────────────────────────────────────────────────────────────────
  function renderGita() {
    const verses = Interp.gitaVerses;
    const dayIdx = new Date().getDate() % verses.length;
    const v = verses[dayIdx];
    document.getElementById('gitaPanel').innerHTML = `
      <div class="gita-card">
        <div class="gita-verse-num">Bhagavad Gita · Chapter ${v.verse}</div>
        <div class="gita-text">"${v.text}"</div>
        <button class="gita-rotate-btn" onclick="nextGita()">→ Next Verse</button>
      </div>
      <div style="background:var(--bg1);border:1px solid var(--borderS);border-radius:var(--rs);padding:16px;margin-top:14px">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);font-family:sans-serif;margin-bottom:8px">Contemplation for Today</div>
        <div style="font-size:15px;color:var(--text2);line-height:1.8;font-style:italic">How does this verse apply to your current Dasha period? What action is being called for — or what attachment is being invited to release?</div>
      </div>
      ${verses.map((vv,i)=>`<div class="gita-card" style="opacity:.6"><div class="gita-verse-num">BG ${vv.verse}</div><div class="gita-text" style="font-size:15px">"${vv.text.substring(0,100)}..."</div></div>`).join('')}`;
  }
  window.nextGita = () => { S.gitaIdx = (S.gitaIdx + 1) % Interp.gitaVerses.length; const v = Interp.gitaVerses[S.gitaIdx]; const gc = document.querySelector('.gita-card'); if(gc){ gc.querySelector('.gita-verse-num').textContent=`Bhagavad Gita · Chapter ${v.verse}`; gc.querySelector('.gita-text').textContent=`"${v.text}"`; }};

  // ── Kundali Milan ─────────────────────────────────────────────────────────
  function runKundaliMilan() {
    const get = id => +document.getElementById(id).value;
    const c1 = E.calcChart(get('m1y'),get('m1m'),get('m1d'),get('m1h'),0,19.076,72.877,get('m1u'));
    const c2 = E.calcChart(get('m2y'),get('m2m'),get('m2d'),get('m2h'),0,19.076,72.877,get('m2u'));
    const res = E.kundaliMilan({ moonLon: c1.planets.Moon.lon }, { moonLon: c2.planets.Moon.lon });
    document.getElementById('milanResult').innerHTML = `
      <div class="milan-score-hero">
        <div class="ms-num" style="color:${res.verdictColor}">${res.score}<span class="ms-max">/ ${res.max}</span></div>
        <div class="ms-verdict" style="color:${res.verdictColor}">${res.verdict}</div>
        <div class="ms-sub">Person 1 Moon: <strong>${E.RASHIS[Math.floor(c1.planets.Moon.lon/30)].en}</strong> · Person 2 Moon: <strong>${E.RASHIS[Math.floor(c2.planets.Moon.lon/30)].en}</strong></div>
        <p style="margin-top:12px;font-size:13px;color:var(--text3);font-style:italic">Note: Kundali matching is one perspective. Compatibility is built through conscious communication, shared values, and mutual respect.</p>
      </div>
      <h3 class="section-h3">Ashta Koota Breakdown</h3>
      <div class="koota-grid">${res.details.map(k=>`<div class="koota-card"><div class="koota-name">${k.name}</div><div class="koota-score">${k.score}</div><div class="koota-max">of ${k.max}</div></div>`).join('')}</div>`;
  }
  window.runKundaliMilan = runKundaliMilan;

  // ── Star Field ────────────────────────────────────────────────────────────
  function buildStars() {
    const wrap = document.getElementById('starsWrap');
    if (!wrap) return;
    let html = '';
    for (let i = 0; i < 80; i++) {
      const x = Math.random()*100, y = Math.random()*100;
      const s = Math.random()*2+1, d = Math.random()*3;
      const gold = Math.random() > 0.85;
      html += `<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s;${gold?'background:rgba(245,158,11,.8)':''}"></div>`;
    }
    wrap.innerHTML = html;
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  function shareChart() {
    if (!S.profile) return;
    const text = `My Vedic birth chart (Svādhyāya):\nSun: ${S.chart.planets.Sun.rashi.en} · Moon: ${S.chart.planets.Moon.rashi.en} · Ascendant: ${S.chart.planets.Ascendant.rashi.en}\n\nCalculated by Svādhyāya — free, private, no-ads Vedic astrology tool.`;
    if (navigator.share) { navigator.share({ title: 'My Kundali — Svādhyāya', text }); }
    else { navigator.clipboard.writeText(text).then(() => alert('Chart details copied to clipboard!')); }
  }
  window.shareChart = shareChart;

  // ── Philosophy Cards ──────────────────────────────────────────────────────
  function renderPhilCards() {
    const el = document.getElementById('philStrip');
    if (!el) return;
    el.innerHTML = Interp.philosophyCards.map(c=>`<div class="phil-card"><div class="phil-icon">${c.icon}</div><div class="phil-title">${c.title}</div><div class="phil-text">${c.text}</div></div>`).join('');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    buildStars();
    renderPhilCards();

    // Restore settings
    const theme = load('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '🌙' : '☀️';
    S.chartStyle = load('chartStyle') || 'north';
    S.tempUnit = load('tempUnit') || 'C';
    S.lang = load('lang') || 'en';

    // Restore profile
    const saved = load('profile');
    if (saved) {
      S.profile = saved;
      try {
        S.chart = E.calcChart(saved.year, saved.month, saved.day, saved.hour, saved.min, saved.lat, saved.lon, saved.tz);
        // Prefill form
        ['day','month','year','hour','min','lat','lon','tz'].forEach(k => {
          const el = document.getElementById('f'+k.charAt(0).toUpperCase()+k.slice(1));
          if (el) el.value = saved[k];
        });
        const fn = document.getElementById('fName'); if(fn) fn.value = saved.name;
        const fp = document.getElementById('fPlace'); if(fp) fp.value = saved.place||'';
        showSection('sec-main');
        updateHeader();
        renderChart();
        renderPlanetTable();
        updateDayNight();
        fetchWeather(saved.lat, saved.lon);
      } catch(e) { showSection('sec-landing'); }
    }

    // Chart style buttons
    const csBtn = document.getElementById('cs-' + S.chartStyle);
    if (csBtn) csBtn.classList.add('active');

    // Event listeners
    document.getElementById('birthForm').addEventListener('submit', handleForm);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('settingsToggle').addEventListener('click', openSettings);
    document.getElementById('settingsOverlay').addEventListener('click', e => { if(e.target === e.currentTarget) closeSettings(); });

    // PWA install
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.deferredInstall = e; });

    // Service worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  }

  return { init, showSection, switchTab };
})();

document.addEventListener('DOMContentLoaded', App.init);
