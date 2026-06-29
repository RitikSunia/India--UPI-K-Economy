import { useMemo, useState } from 'react'
import {
  useRegionStore,
  type BorderLayerSettings,
  type LineStyle,
  type MapStyle,
  type StateFillMode,
} from '../core/store/useRegionStore'

const MAP_STYLES: Array<{ id: MapStyle; label: string }> = [
  { id: 'realistic', label: 'Realistic' },
  { id: 'political', label: 'Political' },
  { id: 'night', label: 'Night' },
]

const LINE_STYLES: Array<{ id: LineStyle; label: string }> = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
]

type UiTweaksTab = 'borders' | 'stateFills'

function BorderLayerControls({
  title,
  settings,
  onChange,
}: {
  title: string
  settings: BorderLayerSettings
  onChange: (patch: Partial<BorderLayerSettings>) => void
}) {
  return (
    <fieldset className="border-controls__fieldset">
      <legend className="border-controls__legend">
        <label className="border-controls__toggle">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          {title}
        </label>
      </legend>

      <label className="border-controls__field">
        Color
        <input
          type="color"
          value={settings.color}
          onChange={(e) => onChange({ color: e.target.value })}
          disabled={!settings.enabled}
        />
      </label>

      <label className="border-controls__field">
        Thickness
        <input
          type="range"
          min={0.5}
          max={6}
          step={0.5}
          value={settings.width}
          onChange={(e) => onChange({ width: Number(e.target.value) })}
          disabled={!settings.enabled}
        />
        <span className="border-controls__value">{settings.width}px</span>
      </label>

      <label className="border-controls__field">
        Opacity
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={settings.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
          disabled={!settings.enabled}
        />
        <span className="border-controls__value">{Math.round(settings.opacity * 100)}%</span>
      </label>

      <label className="border-controls__field">
        Line style
        <select
          value={settings.style}
          onChange={(e) => onChange({ style: e.target.value as LineStyle })}
          disabled={!settings.enabled}
        >
          {LINE_STYLES.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  )
}

function StateFillsTab() {
  const borderSettings = useRegionStore((s) => s.borderSettings)
  const setBorderSettings = useRegionStore((s) => s.setBorderSettings)
  const setStateFillColor = useRegionStore((s) => s.setStateFillColor)
  const resetStateFillColors = useRegionStore((s) => s.resetStateFillColors)
  const regions = useRegionStore((s) => s.dataset?.regions)
  const [search, setSearch] = useState('')

  const stateList = useMemo(() => {
    if (!regions) return []
    return Object.entries(regions)
      .map(([id, data]) => ({ id, name: data.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [regions])

  const filteredStates = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stateList
    return stateList.filter((s) => s.name.toLowerCase().includes(q))
  }, [stateList, search])

  return (
    <>
      <fieldset className="border-controls__fieldset">
        <legend className="border-controls__legend">Global fill options</legend>
        <label className="border-controls__toggle">
          <input
            type="checkbox"
            checked={borderSettings.showStateFills}
            onChange={(e) => setBorderSettings({ showStateFills: e.target.checked })}
          />
          Show India state fills
        </label>

        <label className="border-controls__field">
          Fill mode
          <select
            value={borderSettings.stateFillMode}
            onChange={(e) =>
              setBorderSettings({ stateFillMode: e.target.value as StateFillMode })
            }
            disabled={!borderSettings.showStateFills}
          >
            <option value="metric">Metric choropleth (active metric)</option>
            <option value="manual">Manual per-state colors</option>
          </select>
        </label>

        <label className="border-controls__field">
          Default fill color
          <input
            type="color"
            value={borderSettings.stateFillColor}
            onChange={(e) => setBorderSettings({ stateFillColor: e.target.value })}
            disabled={!borderSettings.showStateFills}
          />
        </label>

        <label className="border-controls__field">
          Fill opacity
          <input
            type="range"
            min={0.02}
            max={0.4}
            step={0.02}
            value={borderSettings.stateFillOpacity}
            onChange={(e) =>
              setBorderSettings({ stateFillOpacity: Number(e.target.value) })
            }
            disabled={!borderSettings.showStateFills}
          />
          <span className="border-controls__value">
            {Math.round(borderSettings.stateFillOpacity * 100)}%
          </span>
        </label>
      </fieldset>

      {borderSettings.stateFillMode === 'manual' && (
        <fieldset className="border-controls__fieldset">
          <legend className="border-controls__legend">Per-state colors</legend>
          <input
            type="search"
            className="ui-tweaks__search"
            placeholder="Search states…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="ui-tweaks__reset-btn"
            onClick={resetStateFillColors}
          >
            Reset all custom colors
          </button>
          <ul className="ui-tweaks__state-list">
            {filteredStates.map(({ id, name }) => {
              const color = borderSettings.stateFillColors[id] ?? borderSettings.stateFillColor
              return (
                <li key={id} className="ui-tweaks__state-row">
                  <span className="ui-tweaks__state-name">{name}</span>
                  <input
                    type="color"
                    value={color}
                    aria-label={`Fill color for ${name}`}
                    onChange={(e) => setStateFillColor(id, e.target.value)}
                  />
                </li>
              )
            })}
          </ul>
        </fieldset>
      )}
    </>
  )
}

export function GlobeControls() {
  const mapStyle = useRegionStore((s) => s.mapStyle)
  const setMapStyle = useRegionStore((s) => s.setMapStyle)
  const autoRotateEnabled = useRegionStore((s) => s.autoRotateEnabled)
  const setAutoRotateEnabled = useRegionStore((s) => s.setAutoRotateEnabled)
  const introComplete = useRegionStore((s) => s.introComplete)
  const borderSettings = useRegionStore((s) => s.borderSettings)
  const setCountryBorder = useRegionStore((s) => s.setCountryBorder)
  const setIndiaStateBorder = useRegionStore((s) => s.setIndiaStateBorder)
  const [uiTweaksOpen, setUiTweaksOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<UiTweaksTab>('borders')

  return (
    <div className="globe-controls-wrap">
      <div className="globe-controls" aria-label="Globe controls">
        <div className="globe-controls__group" role="group" aria-label="Map style">
          {MAP_STYLES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`globe-controls__btn ${mapStyle === id ? 'active' : ''}`}
              onClick={() => setMapStyle(id)}
              aria-pressed={mapStyle === id}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="globe-controls__divider" aria-hidden />

        <div className="globe-controls__group" role="group" aria-label="Auto rotation">
          <button
            type="button"
            className={`globe-controls__btn ${autoRotateEnabled ? 'active' : ''}`}
            onClick={() => setAutoRotateEnabled(true)}
            disabled={!introComplete}
            aria-pressed={autoRotateEnabled}
          >
            Play
          </button>
          <button
            type="button"
            className={`globe-controls__btn ${!autoRotateEnabled ? 'active' : ''}`}
            onClick={() => setAutoRotateEnabled(false)}
            disabled={!introComplete}
            aria-pressed={!autoRotateEnabled}
          >
            Pause
          </button>
        </div>

        <div className="globe-controls__divider" aria-hidden />

        <button
          type="button"
          className={`globe-controls__btn ${uiTweaksOpen ? 'active' : ''}`}
          onClick={() => setUiTweaksOpen((v) => !v)}
          aria-expanded={uiTweaksOpen}
        >
          UI Tweaks
        </button>
      </div>

      {uiTweaksOpen && (
        <div className="border-controls ui-tweaks-panel" aria-label="UI tweaks">
          <div className="ui-tweaks__tabs" role="tablist" aria-label="UI tweak sections">
            <button
              type="button"
              role="tab"
              className={`ui-tweaks__tab${activeTab === 'borders' ? ' is-active' : ''}`}
              aria-selected={activeTab === 'borders'}
              onClick={() => setActiveTab('borders')}
            >
              Borders
            </button>
            <button
              type="button"
              role="tab"
              className={`ui-tweaks__tab${activeTab === 'stateFills' ? ' is-active' : ''}`}
              aria-selected={activeTab === 'stateFills'}
              onClick={() => setActiveTab('stateFills')}
            >
              State Fills
            </button>
          </div>

          {activeTab === 'borders' && (
            <div role="tabpanel" className="ui-tweaks__panel">
              <BorderLayerControls
                title="Country borders"
                settings={borderSettings.countries}
                onChange={setCountryBorder}
              />
              <BorderLayerControls
                title="India state borders"
                settings={borderSettings.indiaStates}
                onChange={setIndiaStateBorder}
              />
            </div>
          )}

          {activeTab === 'stateFills' && (
            <div role="tabpanel" className="ui-tweaks__panel">
              <StateFillsTab />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
