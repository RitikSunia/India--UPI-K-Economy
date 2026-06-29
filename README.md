# India UPI & K-Economy Interactive Atlas

[![Live Demo (GitHub Pages)](https://img.shields.io/badge/demo-GitHub%20Pages-46d6b2?style=flat-square)](https://ritiksunia.github.io/India--UPI-K-Economy/)
[![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?style=flat-square)](https://app.netlify.com/)

A **3D interactive atlas** of India's state-level UPI adoption and **K-Economy** indicators — built with React, Three.js, and real NPCI/RBI state data.

**Live demo:** [https://ritiksunia.github.io/India--UPI-K-Economy/](https://ritiksunia.github.io/India--UPI-K-Economy/)

## What it shows

| View | Description |
|------|-------------|
| **Overview** | National KPIs — volume, intensity, top/bottom states |
| **Interactive Globe** | 3D choropleth with state drill-down panel |
| **State Rankings** | Sortable rankings by UPI and K-Economy metrics |
| **Volume vs Intensity** | Scatter plot — market size vs per-capita adoption |
| **State Detail** | Hero KPIs, peers, totals, insights |
| **Methodology** | Sources, formulas, limitations |
| **K-Economy Expansion** | Macro sparklines (CPI, Sensex, GDP) + top-10 table |

## Key finding

UPI is **national in scale but uneven in depth**. Maharashtra leads on transaction volume; Goa leads on per-capita intensity — the **Goa anomaly** is addressed via an include/exclude toggle in the atlas.

## Reports

- [Full analytical report](docs/UPI-K-Economy-State-Atlas-Report.md)
- [Executive summary](docs/UPI-K-Economy-Executive-Summary.md)

## Quick start

```bash
npm install
npm run build:dataset
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build & deploy

```bash
npm run build          # local / Netlify (base path /)
```

**GitHub Pages** deploys automatically on push to `main` via GitHub Actions (base path `/India--UPI-K-Economy/`).

**Netlify:** connect this repo — `netlify.toml` is included. Set build command `npm run build`, publish `dist`.

## Data sources

| Data | Source |
|------|--------|
| UPI state totals | NPCI/RBI statewise UPI ecosystem extract (May 2026) |
| Population | MoHFW 2026 state projections |
| Rural wages | MGNREGA wage rates, FY 2022–23 |
| MGNREGA demand | Person-days by state, FY 2023–24 |
| Macro | CPI, BSE Sensex, World Bank GDP |

## K-Economy score

```
40% UPI per-capita rank + 30% wage rank + 30% inverse MGNREGA demand rank
```

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei)
- [GSAP](https://gsap.com/) animations
- [Zustand](https://zustand.docs.pmnd.rs/) state
- [d3-geo](https://github.com/d3/d3-geo) projections

Earth textures load from CDN (no local texture files required).

## License

MIT — see [LICENSE](LICENSE).

## Author

[RitikSunia](https://github.com/RitikSunia)
