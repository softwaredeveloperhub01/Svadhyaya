'use strict';
const ChartRenderer = (() => {
  const PC = VedicEngine.PLANET_COLORS;
  const PS = VedicEngine.PLANET_SYMBOLS;

  function groupBySign(planets) {
    const map = {};
    for (const [name, data] of Object.entries(planets)) {
      if (!data || typeof data !== 'object') continue;
      const si = data.rashiIdx;
      if (!map[si]) map[si] = [];
      map[si].push({ name, ...data });
    }
    return map;
  }

  function renderPlanetText(svgArr, planets, cx, cy, spread = 16) {
    if (!planets || !planets.length) return;
    const rows = Math.ceil(planets.length / 2);
    const startY = cy - ((rows - 1) * (spread * 0.7)) / 2;
    planets.forEach((p, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = cx + (col === 0 ? -spread * 0.7 : spread * 0.7);
      const y = startY + row * spread * 0.75;
      const c = PC[p.name] || '#94A3B8';
      svgArr.push(`<text x="${x}" y="${y}" text-anchor="middle" fill="${c}" font-size="11" font-weight="700" font-family="Georgia">${PS[p.name] || p.name.substring(0,2)}</text>`);
      svgArr.push(`<text x="${x}" y="${y + 9}" text-anchor="middle" fill="${c}" font-size="7" opacity="0.75" font-family="Georgia">${parseFloat(p.degInRashi || 0).toFixed(0)}°</text>`);
    });
  }

  // ── North Indian Chart ────────────────────────────────────────────────────
  function northIndian(planets, size = 420) {
    const W = size, H = size, C = W / 2, Q = W / 4;
    const ascIdx = planets.Ascendant ? planets.Ascendant.rashiIdx : 0;
    const signMap = groupBySign(planets);
    const RASHIS = VedicEngine.RASHIS;

    // 12 house cells - North Indian diamond layout
    const cells = [
      // House 1 – top center ◇
      { poly: `${Q},0 ${3*Q},0 ${C},${Q}`, cx: C, cy: Q*0.55, hNum: 1 },
      // House 2 – top right
      { poly: `${3*Q},0 ${W},0 ${W},${Q} ${C},${Q}`, cx: C+Q*0.65, cy: Q*0.5, hNum: 2 },
      // House 3 – right
      { poly: `${W},${Q} ${W},${3*Q} ${3*Q},${C}`, cx: W-Q*0.38, cy: C, hNum: 3 },
      // House 4 – bottom right
      { poly: `${W},${3*Q} ${W},${H} ${3*Q},${H} ${C},${3*Q}`, cx: C+Q*0.65, cy: H-Q*0.5, hNum: 4 },
      // House 5 – bottom center
      { poly: `${3*Q},${H} ${Q},${H} ${C},${3*Q}`, cx: C, cy: H-Q*0.55, hNum: 5 },
      // House 6 – bottom left
      { poly: `${Q},${H} ${0},${H} ${0},${3*Q} ${C},${3*Q}`, cx: C-Q*0.65, cy: H-Q*0.5, hNum: 6 },
      // House 7 – left
      { poly: `${0},${3*Q} ${Q},${C} ${0},${Q}`, cx: Q*0.38, cy: C, hNum: 7 },
      // House 8 – top left
      { poly: `${0},${0} ${Q},0 ${C},${Q} ${0},${Q}`, cx: C-Q*0.65, cy: Q*0.5, hNum: 8 },
      // House 9 (inner tl)
      { poly: `${Q},0 ${C},${Q} ${Q},${C} ${0},${Q}`, cx: Q*0.65, cy: C*0.55, hNum: 9 },
      // House 10 (inner top)
      { poly: `${Q},0 ${3*Q},0 ${C},${Q}`, cx: C, cy: Q*0.55, hNum: 10 },  // reuse 1 position for lagna marker
      // House 11 (inner tr)
      { poly: `${3*Q},0 ${W},${Q} ${C},${Q}`, cx: W-Q*0.65, cy: C*0.55, hNum: 11 },
      // House 12 – center diamond
      { poly: `${C},${Q} ${3*Q},${C} ${C},${3*Q} ${Q},${C}`, cx: C, cy: C, hNum: 12 }
    ];

    // Reassign house cells properly for NI chart (fixed houses, rotating signs)
    const fixedCells = [
      { poly:`${Q},0 ${3*Q},0 ${C},${Q}`, cx:C, cy:Q*0.5 },           // H1
      { poly:`${3*Q},0 ${W},0 ${W},${Q} ${C},${Q}`, cx:C+Q*0.6, cy:Q*0.48 }, // H2
      { poly:`${W},0 ${W},${Q} ${3*Q},${C} ${W},${Q}`, cx:W-Q*0.3, cy:C-Q*0.4 }, // H3 — fix
      { poly:`${W},${Q} ${W},${3*Q} ${3*Q},${C}`, cx:W-Q*0.3, cy:C },  // H3 real
      { poly:`${3*Q},${C} ${W},${3*Q} ${W},${H} ${3*Q},${H} ${C},${3*Q}`, cx:C+Q*0.6, cy:H-Q*0.48 }, // H4
      { poly:`${3*Q},${H} ${Q},${H} ${C},${3*Q}`, cx:C, cy:H-Q*0.5 },  // H5
      { poly:`${Q},${H} ${0},${H} ${0},${3*Q} ${C},${3*Q}`, cx:C-Q*0.6, cy:H-Q*0.48 }, // H6
      { poly:`${0},${3*Q} ${Q},${C} ${0},${Q}`, cx:Q*0.3, cy:C },       // H7
      { poly:`${0},${0} ${Q},0 ${C},${Q} ${0},${Q}`, cx:C-Q*0.6, cy:Q*0.48 }, // H8
      { poly:`${Q},0 ${C},${Q} ${Q},${C} ${0},${Q}`, cx:Q*0.6, cy:C*0.55 },  // H9
      { poly:`${C},${Q} ${3*Q},${C} ${C},${3*Q} ${Q},${C}`, cx:C, cy:C+Q*0.1 }, // H10 center
      { poly:`${3*Q},0 ${W},${Q} ${3*Q},${C} ${C},${Q}`, cx:W-Q*0.6, cy:C*0.55 }, // H11
      { poly:`${W},${Q} ${W},${3*Q} ${3*Q},${C}`, cx:W-Q*0.3, cy:C+Q*0.1 }, // H12
    ];

    // 12 houses correctly
    const houseData = Array.from({length:12}, (_,i) => {
      const signIdx = (ascIdx + i) % 12;
      const hNum = i + 1;
      const planetsHere = signMap[signIdx] || [];
      return { signIdx, hNum, planetsHere };
    });

    const NI_CELLS = [
      {poly:`${Q},0 ${3*Q},0 ${C},${Q}`, cx:C, cy:Q*0.55},
      {poly:`${3*Q},0 ${W},0 ${W},${Q} ${C},${Q}`, cx:C+Q*0.58, cy:Q*0.42},
      {poly:`${W},${Q} ${W},${3*Q} ${3*Q},${C}`, cx:W-Q*0.32, cy:C},
      {poly:`${3*Q},${C} ${W},${3*Q} ${W},${H} ${3*Q},${H} ${C},${3*Q}`, cx:C+Q*0.58, cy:H-Q*0.42},
      {poly:`${Q},${H} ${3*Q},${H} ${C},${3*Q}`, cx:C, cy:H-Q*0.55},
      {poly:`${0},${3*Q} ${0},${H} ${Q},${H} ${C},${3*Q}`, cx:C-Q*0.58, cy:H-Q*0.42},
      {poly:`${0},${Q} ${Q},${C} ${0},${3*Q}`, cx:Q*0.32, cy:C},
      {poly:`${0},0 ${Q},0 ${C},${Q} ${0},${Q}`, cx:C-Q*0.58, cy:Q*0.42},
      {poly:`${Q},0 ${C},${Q} ${Q},${C} ${0},${Q}`, cx:Q*0.68, cy:C*0.55},
      {poly:`${C},${Q} ${3*Q},${C} ${C},${3*Q} ${Q},${C}`, cx:C, cy:C},
      {poly:`${3*Q},0 ${W},${Q} ${3*Q},${C} ${C},${Q}`, cx:W-Q*0.68, cy:C*0.55},
      {poly:`${W},${Q} ${W},${3*Q} ${3*Q},${C}`, cx:W-Q*0.32, cy:H-Q*0.25},
    ];
    // Override house 12 to be the right middle
    // Actually use proper 12-cell layout

    const svg = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto">`];
    svg.push(`<rect width="${W}" height="${H}" fill="#0A0F1E" rx="10"/>`);

    NI_CELLS.forEach((cell, i) => {
      const h = houseData[i];
      const isLagna = i === 0;
      svg.push(`<polygon points="${cell.poly}" fill="${isLagna?'rgba(251,191,36,0.1)':'rgba(255,255,255,0.02)'}" stroke="rgba(251,191,36,0.25)" stroke-width="1"/>`);
      // House number
      svg.push(`<text x="${cell.cx}" y="${cell.cy - 10}" text-anchor="middle" fill="rgba(251,191,36,0.35)" font-size="9" font-family="Georgia">${h.hNum}</text>`);
      // Sign
      svg.push(`<text x="${cell.cx}" y="${cell.cy + 2}" text-anchor="middle" fill="rgba(148,163,184,0.5)" font-size="8" font-family="Georgia">${RASHIS[h.signIdx].en.substring(0,3)}</text>`);
      if (isLagna) svg.push(`<text x="${cell.cx}" y="${cell.cy + 13}" text-anchor="middle" fill="#FBBF24" font-size="8" font-family="Georgia">Lag</text>`);
      // Planets
      renderPlanetText(svg, h.planetsHere, cell.cx, cell.cy + 26);
    });

    // Center OM
    svg.push(`<text x="${C}" y="${C + 6}" text-anchor="middle" fill="rgba(251,191,36,0.15)" font-size="32" font-family="Georgia">ॐ</text>`);
    svg.push('</svg>');
    return svg.join('');
  }

  // ── South Indian Chart ─────────────────────────────────────────────────────
  function southIndian(planets, size = 420) {
    const W = size, H = size, CW = W / 4, CH = H / 4;
    const ascIdx = planets.Ascendant ? planets.Ascendant.rashiIdx : 0;
    const RASHIS = VedicEngine.RASHIS;
    // Fixed sign layout: Pisces top-left going right
    const SIGN_LAYOUT = [
      [11,0,1,2], [10,null,null,3], [9,null,null,4], [8,7,6,5]
    ];
    const signMap = groupBySign(planets);
    const svg = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto">`];
    svg.push(`<rect width="${W}" height="${H}" fill="#0A0F1E" rx="10"/>`);

    SIGN_LAYOUT.forEach((row, ri) => {
      row.forEach((si, ci) => {
        if (si === null) return;
        const x = ci * CW, y = ri * CH;
        const isAsc = si === ascIdx;
        const hNum = (si - ascIdx + 12) % 12 + 1;
        const planetsHere = signMap[si] || [];
        svg.push(`<rect x="${x+1}" y="${y+1}" width="${CW-2}" height="${CH-2}" fill="${isAsc?'rgba(251,191,36,0.1)':'rgba(255,255,255,0.02)'}" stroke="rgba(251,191,36,0.25)" stroke-width="1" rx="2"/>`);
        svg.push(`<text x="${x+CW/2}" y="${y+13}" text-anchor="middle" fill="rgba(148,163,184,0.6)" font-size="9" font-family="Georgia">${RASHIS[si].en.substring(0,3)}</text>`);
        svg.push(`<text x="${x+CW-6}" y="${y+13}" text-anchor="end" fill="rgba(251,191,36,0.35)" font-size="8" font-family="Georgia">${hNum}</text>`);
        if (isAsc) svg.push(`<text x="${x+6}" y="${y+13}" text-anchor="start" fill="#FBBF24" font-size="8" font-family="Georgia">Lg</text>`);
        renderPlanetText(svg, planetsHere, x + CW / 2, y + CH / 2 + 4);
      });
    });

    // Center box
    svg.push(`<rect x="${CW}" y="${CH}" width="${2*CW}" height="${2*CH}" fill="rgba(251,191,36,0.02)" stroke="rgba(251,191,36,0.15)" stroke-width="1"/>`);
    svg.push(`<text x="${W/2}" y="${H/2 - 4}" text-anchor="middle" fill="rgba(251,191,36,0.2)" font-size="28" font-family="Georgia">ॐ</text>`);
    svg.push(`<text x="${W/2}" y="${H/2 + 16}" text-anchor="middle" fill="rgba(148,163,184,0.2)" font-size="9" font-family="Georgia">Svādhyāya</text>`);
    svg.push('</svg>');
    return svg.join('');
  }

  return { northIndian, southIndian };
})();
