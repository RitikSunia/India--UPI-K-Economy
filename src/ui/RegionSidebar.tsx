import { useRegionStore } from '../core/store/useRegionStore'
import { groupRegions } from '../core/dataset/indexDataset'

export function RegionSidebar() {
  const dataset = useRegionStore((s) => s.dataset)
  const selectedId = useRegionStore((s) => s.selectedId)
  const setSelectedId = useRegionStore((s) => s.setSelectedId)
  const sidebarOpen = useRegionStore((s) => s.sidebarOpen)
  const setSidebarOpen = useRegionStore((s) => s.setSidebarOpen)

  if (!dataset) return null

  const grouped = groupRegions(dataset.regions, dataset.config.groups)

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="Toggle region list"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`region-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <header className="region-sidebar__header">
          <h1>{dataset.config.title}</h1>
          <p>{dataset.config.subtitle ?? 'Select a state or union territory'}</p>
        </header>

        <div className="region-sidebar__groups">
          {grouped.map(({ group, items }) =>
            items.length ? (
              <section key={group.id} className="region-group">
                <h2>{group.label}</h2>
                <ul>
                  {items.map(({ id, data }) => (
                    <li key={id}>
                      <button
                        type="button"
                        className={selectedId === id ? 'active' : ''}
                        onClick={() => setSelectedId(id)}
                      >
                        {data.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      </aside>
    </>
  )
}
