# ॐ Svādhyāya · स्वाध्याय

**Self-Study · Self-Awareness · Complete Vedic Astrology Suite**

> A free, private, ad-free Vedic astrology and Panchang app — 100% in your browser.

🌐 **[Live Demo](https://softwaredeveloperhub01.github.io/svadhyaya)** | No server. No login. No tracking.

---

## ✨ Features

### 🔭 Birth Chart (Kundali)
- North Indian (diamond) + South Indian (square grid) with toggle
- All 9 planets + Ascendant with precise sidereal positions (Lahiri Ayanamsa)
- Nakshatra, Pada, Rashi for every planet
- **The "Why?" toggle** — click `?` for interpretation + exact astronomical math
- Yoga detection (Gaja Kesari, Budhaditya, Kaal Sarp, Mangal Dosha, and more)

### 📅 Panchang
- Tithi, Nakshatra, Yoga, Karana, Vaar, Paksha
- Hindu month, Vikram Samvat, Ayana, Ritu
- Sunrise, Sunset, Moonrise, Moonset
- Rahu Kaal, Gulika Kaal, Yamagandam
- Abhijit Muhurat, Dur Muhurat
- Full Choghadiya (Day/Night)
- Hora calculator
- Navigate any date

### 🌙 Today's Vibe
- Real-time Moon transit emotional forecast
- Personal Day Quality score (1–10)
- Good/challenging energy analysis
- Lucky Color, Number, Gem, Day
- Sade Sati detection with phase (Rising/Peak/Setting)
- Current planetary transit impact on YOUR birth chart

### ⏳ Vimshottari Dasha
- Full 120-year life chapter timeline
- Visual timeline bar
- Current dasha + sub-period
- Strategy language for each period

### 🔭 Live Transits
- Real-time positions of all 9 planets
- Transit impact analysis on your natal chart

### 🗓️ Festival Calendar
- Monthly Hindu calendar view
- Tithi shown on every day
- Moon phase display
- 50+ Hindu festivals and vrats (2024–2026)
- Ekadashi, Purnima, Amavasya, Navratri, Diwali, Holi, etc.

### ✨ Muhurat
- Auspicious times today (Abhijit, Choghadiya)
- Activity-based muhurat guidance (marriage, travel, business)
- Hora timing

### 🔎 Evidence Vault
- 6 major historical transits with reflection journal
- Your notes saved only in your browser

### 🔢 Numerology
- Life Path number
- Birth number
- Vedic Moon sign correspondences

### 💎 Remedies & Strategy
- All 9 planets with gems, mantras, colors, fasting days
- Strategy-first language (no "bad luck")

### 📖 Bhagavad Gita
- Daily rotating verse
- Contemplation prompt

### 💑 Kundali Milan
- Ashta Koota (8-factor) compatibility scoring
- Score out of 36 with breakdown

---

## 🔒 Privacy Design

| Feature | Detail |
|---------|--------|
| Data Storage | `localStorage` only — never leaves your device |
| Server | None. Zero backend. |
| Tracking | None. No analytics. No cookies. |
| Ads | None. Ever. |
| Offline | Full PWA — works without internet once loaded |
| Open Source | 100% transparent code |

---

## 🚀 Deploy to GitHub Pages (Free)

1. **Fork or upload** this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Under "Source", select **Deploy from branch → main**
4. Your app is live at `https://yourusername.github.io/svadhyaya`

No build step. No npm. No Node.js. Just static files.

---

## 📁 File Structure

```
svadhyaya/
├── index.html          ← Complete app (all sections)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline)
├── icon.svg            ← App icon
├── css/
│   └── styles.css      ← Full stylesheet (Day/Night themes)
└── js/
    ├── engine.js       ← Astronomical calculations
    ├── chart.js        ← SVG Kundali renderer
    ├── interp.js       ← Interpretation dictionary
    └── app.js          ← Main UI controller
```

---

## 🔬 Scientific Foundation

- **Planetary positions**: VSOP87-simplified algorithms (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
- **Rahu/Ketu**: Precise lunar node calculation
- **Ayanamsa**: Lahiri (most widely used in Indian Vedic astrology)
- **Ascendant**: Full sidereal time calculation using geographic coordinates
- **Sunrise/Sunset**: Solar declination formula
- **Accuracy**: ~0.5–1° compared to Swiss Ephemeris (professional tools)

---

## 🌿 Philosophy

> *"Planets provide the atmosphere. You choose the response."*

This app uses **strategy language** — no "bad luck", no "you will suffer", no predictions of fate.

Every interpretation shows its astronomical source via the **Why? toggle**.

---

## 🤝 Contributing

Open source. MIT License. Contributions welcome — especially:
- More interpretation content
- Additional languages (Tamil, Telugu, Marathi, Kannada, Bengali, Gujarati)
- Navamsa (D9) and other divisional charts
- Ashtakavarga scoring
- Lal Kitab features

---

*"Svādhyāya" — One of the Niyamas in Yoga. The study of the self.*
