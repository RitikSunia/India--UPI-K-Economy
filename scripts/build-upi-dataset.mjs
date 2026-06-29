/**
 * Generates datasets/upi-states/ from ../india_upi_keconomy_data.json
 * Run: node scripts/build-upi-dataset.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const upiPath = path.join(root, '..', 'india_upi_keconomy_data.json')
const boundariesSrc = path.join(root, 'datasets', 'india-states', 'boundaries.geojson')
const outDir = path.join(root, 'datasets', 'upi-states')
const publicOut = path.join(root, 'public', 'datasets', 'upi-states')

const TEXTURE_CDN = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img'

const GROUP_MAP = {
  'Himachal Pradesh': 'north',
  Punjab: 'north',
  Haryana: 'north',
  Uttarakhand: 'north',
  Rajasthan: 'north',
  'Uttar Pradesh': 'north',
  'Jammu and Kashmir': 'north',
  Ladakh: 'north',
  Delhi: 'north',
  Chandigarh: 'north',
  Kerala: 'south',
  'Tamil Nadu': 'south',
  Karnataka: 'south',
  'Andhra Pradesh': 'south',
  Telangana: 'south',
  Puducherry: 'south',
  Lakshadweep: 'south',
  'West Bengal': 'east',
  Odisha: 'east',
  Bihar: 'east',
  Jharkhand: 'east',
  Sikkim: 'east',
  Gujarat: 'west',
  Goa: 'west',
  Maharashtra: 'west',
  'Dadra and Nagar Haveli and Daman and Diu': 'west',
  'Madhya Pradesh': 'central',
  Chhattisgarh: 'central',
  Assam: 'northeast',
  'Arunachal Pradesh': 'northeast',
  Manipur: 'northeast',
  Meghalaya: 'northeast',
  Mizoram: 'northeast',
  Nagaland: 'northeast',
  Tripura: 'northeast',
  'Andaman and Nicobar': 'northeast',
}

const NAME_ALIASES = {
  'DADRA & NAGAR HAVELI & DAMAN & DIU': 'Dadra and Nagar Haveli and Daman and Diu',
  'ANDAMAN AND NICOBAR ISLANDS': 'Andaman and Nicobar',
  ODISHA: 'Odisha',
  'JAMMU AND KASHMIR': 'Jammu and Kashmir',
}

function upiIsoToNe(iso) {
  if (!iso || iso.length < 4) return iso
  return `${iso.slice(0, 2)}-${iso.slice(2)}`
}

function fmt(n, decimals = 0) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function domain(arr) {
  const valid = arr.filter((v) => v != null && !Number.isNaN(Number(v)))
  if (!valid.length) return /** @type {[number, number]} */ ([0, 1])
  return /** @type {[number, number]} */ ([Math.min(...valid), Math.max(...valid)])
}

function main() {
  if (!fs.existsSync(upiPath)) {
    const hasOutput = fs.existsSync(path.join(outDir, 'regions.json'))
    if (hasOutput) {
      console.log(
        'Skipping dataset build: india_upi_keconomy_data.json not found; using committed datasets/upi-states/',
      )
      return
    }
    throw new Error(`Missing source data: ${upiPath}`)
  }

  const upi = JSON.parse(fs.readFileSync(upiPath, 'utf8'))
  const boundaries = JSON.parse(fs.readFileSync(boundariesSrc, 'utf8'))
  const byNeIso = new Map(boundaries.features.map((f) => [f.properties.iso_3166_2, f.properties.name]))
  const byName = new Map(
    boundaries.features.map((f) => [f.properties.name.toLowerCase(), f.properties.iso_3166_2]),
  )

  const totalTxnMn = upi.states.reduce((s, st) => s + (st.upi_transactions_mn || 0), 0)
  const totalValueCr = upi.states.reduce((s, st) => s + (st.upi_value_cr || 0), 0)
  const totalPop = upi.states.reduce((s, st) => s + (st.population_2026 || 0), 0)

  const ranked = [...upi.states]
    .filter((s) => s.upi_txn_per_capita != null)
    .sort((a, b) => b.upi_txn_per_capita - a.upi_txn_per_capita)
  const intensityRank = new Map(ranked.map((s, i) => [s.iso, i + 1]))

  const regions = {}
  const warnings = []

  for (const state of upi.states) {
    const neIso = upiIsoToNe(state.iso)
    let regionName = state.name
    const alias = NAME_ALIASES[state.key] || NAME_ALIASES[state.name?.toUpperCase()]
    if (alias) regionName = alias

    if (!byNeIso.has(neIso)) {
      const byNm = byName.get(regionName.toLowerCase())
      if (byNm) {
        warnings.push(`ISO ${state.iso} -> ${neIso} not in boundaries; matched by name "${regionName}" -> ${byNm}`)
      } else {
        warnings.push(`No boundary match for ${state.name} (${state.iso} / ${neIso})`)
      }
    }

    const id = byNeIso.has(neIso) ? neIso : byName.get(regionName.toLowerCase()) || neIso
    const volumeShare = totalTxnMn ? (state.upi_transactions_mn / totalTxnMn) * 100 : null

    regions[id] = {
      name: byNeIso.get(id) || regionName,
      group: GROUP_MAP[byNeIso.get(id) || regionName] || 'central',
      upiIso: state.iso,
      fields: {
        k_economy_score: String(state.k_economy_score ?? '—'),
        k_economy_rank: String(state.k_economy_rank ?? '—'),
        upi_txn_per_capita: fmt(state.upi_txn_per_capita, 2),
        upi_value_per_capita: fmt(state.upi_value_per_capita, 0),
        upi_transactions_mn: fmt(state.upi_transactions_mn, 2),
        upi_value_cr: fmt(state.upi_value_cr, 2),
        population_2026: fmt(state.population_2026, 0),
        wage_per_day_rs: fmt(state.wage_per_day_rs, 0),
        mgnrega_days_lakh_2324: fmt(state.mgnrega_days_lakh_2324, 2),
        volume_share: volumeShare != null ? `${fmt(volumeShare, 1)}%` : '—',
        intensity_rank: String(intensityRank.get(state.iso) ?? '—'),
        notes: `UPI ref. ${upi.meta.upi_reference_month} · K-Economy composite`,
      },
      metrics: {
        k_economy_score: state.k_economy_score,
        k_economy_rank: state.k_economy_rank,
        upi_txn_per_capita: state.upi_txn_per_capita,
        upi_value_per_capita: state.upi_value_per_capita,
        upi_transactions_mn: state.upi_transactions_mn,
        upi_value_cr: state.upi_value_cr,
        population_2026: state.population_2026,
        wage_per_day_rs: state.wage_per_day_rs,
        mgnrega_days_lakh_2324: state.mgnrega_days_lakh_2324,
        volume_share: volumeShare,
        intensity_rank: intensityRank.get(state.iso) ?? null,
      },
      mgnrega_by_year: state.mgnrega_by_year ?? null,
    }
  }

  const scores = upi.states.map((s) => s.k_economy_score)
  const txn = upi.states.map((s) => s.upi_txn_per_capita)
  const valuePc = upi.states.map((s) => s.upi_value_per_capita)
  const volume = upi.states.map((s) => s.upi_transactions_mn)
  const shares = upi.states.map((s) => (totalTxnMn ? (s.upi_transactions_mn / totalTxnMn) * 100 : null))
  const wage = upi.states.map((s) => s.wage_per_day_rs)
  const mgn = upi.states.map((s) => s.mgnrega_days_lakh_2324)

  const national = {
    totalTransactionsMn: totalTxnMn,
    totalValueCr: totalValueCr,
    totalPopulation: totalPop,
    txPerCapita: totalPop ? (totalTxnMn * 1_000_000) / totalPop : 0,
    valuePerCapita: totalPop ? (totalValueCr * 10_000_000) / totalPop : 0,
    stateCount: upi.states.length,
    upiReferenceMonth: upi.meta.upi_reference_month,
    topFiveVolumeShare: (() => {
      const top5 = [...upi.states].sort((a, b) => b.upi_transactions_mn - a.upi_transactions_mn).slice(0, 5)
      const topTxn = top5.reduce((s, st) => s + st.upi_transactions_mn, 0)
      return totalTxnMn ? (topTxn / totalTxnMn) * 100 : 0
    })(),
  }

  const config = {
    id: 'upi-states',
    title: 'India · UPI & K-Economy',
    subtitle: 'Digital payments intensity across states & union territories',
    columns: [
      { key: 'k_economy_score', label: 'K-Economy score' },
      { key: 'k_economy_rank', label: 'K-Economy rank' },
      { key: 'intensity_rank', label: 'UPI intensity rank' },
      { key: 'upi_txn_per_capita', label: 'UPI txn / person' },
      { key: 'upi_value_per_capita', label: 'UPI value / person (₹)' },
      { key: 'upi_transactions_mn', label: 'UPI transactions (mn)' },
      { key: 'upi_value_cr', label: 'UPI value (₹ cr)' },
      { key: 'volume_share', label: 'National tx share' },
      { key: 'population_2026', label: 'Population (2026 proj.)' },
      { key: 'wage_per_day_rs', label: 'Rural wage (₹/day)' },
      { key: 'mgnrega_days_lakh_2324', label: 'MGNREGA (lakh-days)' },
      { key: 'notes', label: 'Notes' },
    ],
    metrics: [
      {
        key: 'k_economy_score',
        label: 'K-Economy score',
        unit: '0–100',
        domain: domain(scores),
        ramp: ['#ff5d6c', '#ffc24b', '#2ee6a6'],
        default: true,
      },
      {
        key: 'upi_txn_per_capita',
        label: 'UPI intensity',
        unit: 'txn/person',
        domain: domain(txn),
        ramp: ['#1e3a5f', '#46d6b2', '#9bf3c9'],
      },
      {
        key: 'upi_value_per_capita',
        label: 'Value intensity',
        unit: '₹/person',
        domain: domain(valuePc),
        ramp: ['#1a2f4a', '#3d8b7a', '#9bf3c9'],
      },
      {
        key: 'upi_transactions_mn',
        label: 'UPI volume',
        unit: 'mn tx',
        domain: domain(volume),
        ramp: ['#123043', '#46d6b2', '#e8f1f5'],
      },
      {
        key: 'volume_share',
        label: 'National share',
        unit: '% of India',
        domain: domain(shares),
        ramp: ['#2a3f55', '#7c93a3', '#ffc24b'],
      },
      {
        key: 'wage_per_day_rs',
        label: 'Rural wage',
        unit: '₹/day',
        domain: domain(wage),
        ramp: ['#3d2c4d', '#7c93a3', '#e8f1f5'],
      },
      {
        key: 'mgnrega_days_lakh_2324',
        label: 'MGNREGA demand',
        unit: 'lakh-days',
        domain: domain(mgn),
        ramp: ['#2ee6a6', '#ffc24b', '#ff5d6c'],
      },
    ],
    groups: [
      { id: 'north', label: 'North' },
      { id: 'south', label: 'South' },
      { id: 'east', label: 'East' },
      { id: 'west', label: 'West' },
      { id: 'central', label: 'Central' },
      { id: 'northeast', label: 'North East' },
    ],
    intro: {
      from: 'space',
      targetLng: 78,
      targetLat: 22,
      duration: 3.5,
      startAltitude: 4,
      endAltitude: 2.2,
    },
    camera: {
      flyToDuration: 1.2,
      flyToAltitude: 1.65,
    },
    globe: {
      earthRadius: 1,
      stateAltitude: 0.008,
      autoRotateSpeed: 0.35,
    },
    theme: {
      hoverColor: '#46d6b2',
      selectColor: '#9bf3c9',
      accentColor: '#46d6b2',
      textures: {
        day: `${TEXTURE_CDN}/earth-blue-marble.jpg`,
        night: `${TEXTURE_CDN}/earth-night.jpg`,
        bump: `${TEXTURE_CDN}/earth-topology.png`,
        political: `${TEXTURE_CDN}/earth-blue-marble.jpg`,
      },
    },
    meta: upi.meta,
  }

  fs.mkdirSync(outDir, { recursive: true })
  fs.mkdirSync(publicOut, { recursive: true })

  const files = [
    ['config.json', JSON.stringify(config, null, 2)],
    ['regions.json', JSON.stringify(regions, null, 2)],
    ['national.json', JSON.stringify(national, null, 2)],
    ['macro.json', JSON.stringify(upi.macro ?? {}, null, 2)],
  ]

  for (const [name, content] of files) {
    fs.writeFileSync(path.join(outDir, name), content)
    fs.copyFileSync(path.join(outDir, name), path.join(publicOut, name))
  }
  fs.copyFileSync(boundariesSrc, path.join(outDir, 'boundaries.geojson'))
  fs.copyFileSync(path.join(outDir, 'boundaries.geojson'), path.join(publicOut, 'boundaries.geojson'))

  console.log(`Wrote ${Object.keys(regions).length} regions to datasets/upi-states/`)
  warnings.forEach((w) => console.warn(`[warn] ${w}`))
}

main()
