# Dataset Template Guide

This globe is designed as a **reusable template**. All region-specific content lives in a dataset folder; the 3D globe and UI read generic config and do not hardcode India.

## Folder structure

Create a dataset folder with three required files:

```
datasets/<your-dataset-id>/
├── config.json
├── regions.json
└── boundaries.geojson
```

For runtime loading via `fetch`, also copy the folder to `public/datasets/<your-dataset-id>/`.

## 1. `boundaries.geojson`

A GeoJSON `FeatureCollection` where each feature is one clickable region.

**Required feature properties:**

| Property       | Description                                      |
|----------------|--------------------------------------------------|
| `iso_3166_2`   | Unique region ID (must match `regions.json` keys) |
| `name`         | Display name                                     |
| `latitude`     | Optional; centroid is computed from geometry if omitted |
| `longitude`    | Optional                                         |

Supported geometry types: `Polygon`, `MultiPolygon`.

**Tips:**

- Simplify polygons (e.g. Mapshaper) for better performance on mobile.
- IDs must be stable strings — they link boundaries to data rows.

## 2. `regions.json`

Keyed object: `{ "<regionId>": { ... } }`

```json
{
  "IN-KA": {
    "name": "Karnataka",
    "group": "south",
    "fields": {
      "population": "—",
      "capital": "—",
      "area_km2": "—",
      "notes": "Your note here"
    }
  }
}
```

| Field    | Description                                |
|----------|--------------------------------------------|
| `name`   | Display name (can match GeoJSON `name`)    |
| `group`  | Must match a `groups[].id` in `config.json` |
| `fields` | Key-value pairs shown in the detail table  |

## 3. `config.json`

```json
{
  "id": "my-dataset",
  "title": "My Regional Explorer",
  "columns": [
    { "key": "population", "label": "Population" },
    { "key": "capital", "label": "Capital" }
  ],
  "groups": [
    { "id": "north", "label": "North" },
    { "id": "south", "label": "South" }
  ],
  "intro": {
    "from": "space",
    "targetLng": 78,
    "targetLat": 22,
    "duration": 3.5,
    "startAltitude": 4,
    "endAltitude": 2.2
  },
  "camera": {
    "flyToDuration": 1.2,
    "flyToAltitude": 1.65
  },
  "globe": {
    "earthRadius": 1,
    "stateAltitude": 0.008,
    "autoRotateSpeed": 0.35
  },
  "theme": {
    "hoverColor": "#4fc3f7",
    "selectColor": "#ffab40",
    "accentColor": "#7dd3fc"
  }
}
```

Optional `theme.textures` overrides globe texture paths:

```json
"textures": {
  "day": "/textures/earth-day.jpg",
  "night": "/textures/earth-night.jpg",
  "bump": "/textures/earth-bump.jpg",
  "political": "/textures/earth-political.jpg"
}
```

### Config reference (continued)

| Section   | Purpose |
|-----------|---------|
| `columns` | Defines table rows (`key` maps to `fields` in `regions.json`) |
| `groups`  | Sidebar sections; filter regions by `group` id |
| `intro`   | Opening camera animation (`targetLng/Lat` = focal point) |
| `camera`  | Fly-to behavior when a region is selected |
| `globe`   | Earth radius, mesh offset, rotation speed |
| `theme`   | Hover/select highlight colors; optional `textures` paths for realistic/political/night modes |

## Loading a dataset

### Bundled (default)

The app imports `datasets/india-states/` directly. To change the default, edit `src/core/dataset/loadDataset.ts` or add your dataset and point imports there.

### Runtime (env var)

1. Copy your dataset to `public/datasets/<id>/`
2. Create `.env`:

```
VITE_DATASET_ID=my-dataset
```

3. Restart the dev server.

## TypeScript modules (optional)

You can also export data from TS for strongly typed fixtures:

```ts
// datasets/my-dataset/index.ts
import config from './config.json'
import regions from './regions.json'
import boundaries from './boundaries.geojson'

export const myDataset = { config, regions, boundaries }
```

Wire it in `loadDataset.ts` the same way `india-states` is bundled.

## Validation

On load, the app logs warnings for:

- Boundary features without a `regions.json` entry
- `regions.json` entries without a matching boundary

Fix ID mismatches before shipping.

## Adapting beyond India

1. Replace `boundaries.geojson` with your regions (countries, provinces, districts, etc.).
2. Update `regions.json` with matching IDs and dummy `fields`.
3. Adjust `config.json` columns, groups, and intro `targetLng` / `targetLat` to your area of interest.
4. No changes required in `src/core/globe/` unless you need custom shaders or interaction logic.

## CMS / API hookup (future)

`loadDataset()` is the single entry point. Replace the `fetch` branch with an API call that returns `{ config, regions, boundaries }` in the same shape as `LoadedDataset` in `src/core/dataset/types.ts`.
