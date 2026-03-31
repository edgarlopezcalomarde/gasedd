# GasEdd - Implementación Completa

## 1. Resumen del Proyecto

**GasEdd** es una aplicación web progresiva (PWA) para consultar precios de carburantes en España. Utiliza la API pública del Ministerio de Asuntos Económicos y Transformación Digital para obtener datos en tiempo real de gasolineras terrestres y marítimas.

### Objetivos Principales

- Mostrar gasolineras en un mapa interactivo con precios en tiempo real
- Identificar gasolineras más baratas y más caras de la zona visible
- Sistema de colores inteligentes según rangos de precios
- Filtrado por tipo de carburante y ubicación
- Calculadora de combustible (€ ↔ litros)
- Histórico de precios con gráficos
- Aplicación 100% responsive (desktop + móvil)
- Modo offline via PWA

### Stack Tecnológico

| Categoría   | Tecnología                          |
| ----------- | ----------------------------------- |
| Framework   | Vite 8 + React 19                   |
| UI          | shadcn/ui + Tailwind CSS 4          |
| Mapas       | mapcn (MapLibre GL) + OpenFreeMap   |
| Estado      | Zustand + persistencia localStorage |
| Datos       | TanStack Query + Axios              |
| Validación  | Zod                                 |
| Animaciones | Motion (framer-motion)              |
| PWA         | vite-plugin-pwa                     |
| Tipado      | TypeScript                          |

---

## 2. Análisis de la API

### 2.1 Endpoints Disponibles

La API del Ministerio ofrece los siguientes servicios REST:

#### Estaciones Terrestres

| Endpoint                                                 | Descripción                        |
| -------------------------------------------------------- | ---------------------------------- |
| `EstacionesTerrestres/`                                  | Todas las gasolineras de España    |
| `EstacionesTerrestres/FiltroProducto/{ID}`               | Filtrar por carburante             |
| `EstacionesTerrestres/FiltroProvincia/{ID}`              | Filtrar por provincia              |
| `EstacionesTerrestres/FiltroCCAA/{ID}`                   | Filtrar por comunidad autónoma     |
| `EstacionesTerrestres/FiltroMunicipio/{ID}`              | Filtrar por municipio              |
| `EstacionesTerrestres/FiltroProvinciaProducto/{ID}/{ID}` | Filtrar por provincia + carburante |

#### Histórico de Precios

| Endpoint                                                | Descripción                        |
| ------------------------------------------------------- | ---------------------------------- |
| `EstacionesTerrestresHist/{FECHA}`                      | Histórico de todas las gasolineras |
| `EstacionesTerrestresHist/FiltroProvincia/{FECHA}/{ID}` | Histórico por provincia            |
| `EstacionesTerrestresHist/FiltroProducto/{FECHA}/{ID}`  | Histórico por carburante           |

#### Postes Marítimos

| Endpoint                               | Descripción                     |
| -------------------------------------- | ------------------------------- |
| `PostesMaritimos/`                     | Todas las gasolineras marítimas |
| `PostesMaritimos/FiltroProducto/{ID}`  | Filtrar por carburante          |
| `PostesMaritimos/FiltroProvincia/{ID}` | Filtrar por provincia           |

#### Catálogos

| Endpoint                               | Descripción              |
| -------------------------------------- | ------------------------ |
| `Listados/ProductosPetroliferos/`      | Catálogo de carburantes  |
| `Listados/Provincias/`                 | Provincias con IDs       |
| `Listados/ComunidadesAutonomas/`       | Comunidades autónomas    |
| `Listados/Municipios/`                 | Municipios con IDs       |
| `Listados/MunicipiosPorProvincia/{ID}` | Municipios por provincia |
| `Listados/ProvinciasPorComunidad/{ID}` | Provincias por comunidad |

### 2.2 Estructura de Datos

#### Gasolinera (EESSPrecio)

```typescript
interface EESSPrecio {
  IDEESS: string              // ID único de la gasolinera
  Latitud: string            // Latitud (WGS84)
  Longitud_x0020__x0028_WGS84_x0029_: string  // Longitud (WGS84)
  Dirección: string          // Dirección completa
  Localidad: string          // Localidad
  Municipio: string         // Municipio
  Provincia: string         // Provincia
  IDProvincia: string        // ID de provincia
  IDMunicipio: string        // ID de municipio
  IDCCAA: string            // ID de comunidad autónoma
  C.P.: string              // Código postal
  Horario: string           // Horario de atención
  Rótulo: string            // Nombre de la gasolinera
  Margen: string            // Margen (I=Internet, D=Delegación, etc.)
  Tipo_Venta: string        // Tipo de venta
  Remisión: string          // Remisión

  // Precios de carburantes
  Precio_Gasolina_95_E5: string
  Precio_Gasolina_95_E10: string
  Precio_Gasolina_95_E25: string
  Precio_Gasolina_95_E85: string
  Precio_Gasolina_95_E5_Premium: string
  Precio_Gasolina_98_E5: string
  Precio_Gasolina_98_E10: string
  Precio_Gasolina_Renovable: string

  Precio_Gasoleo_A: string
  Precio_Gasoleo_B: string
  Precio_Gasoleo_Premium: string
  Precio_Diésel_Renovable: string

  Precio_Gases_licuados_del_petroleo: string  // GLP
  Precio_Gas_Natural_Comprimido: string      // GNC
  Precio_Gas_Natural_Licuado: string         // GNL
  Precio_Biodiesel: string
  Precio_Bioetanol: string
  Precio_Biogas_Natural_Comprimido: string
  Precio_Biogas_Natural_Licuado: string
  Precio_Adblue: string
  Precio_Amoniaco: string
  Precio_Metanol: string
  Precio_Hidrogeno: string

  _x0025__x0020_BioEtanol: string            // % bioetanol
  _x0025__x0020_Ester_metilico: string       // % éster metílico
}
```

#### Producto Petrolífero

```typescript
interface ProductoPetrolifero {
  IDProducto: string
  NombreProducto: string
  NombreProductoAbreviatura: string
}
```

#### Provincia

```typescript
interface Provincia {
  IDProvincia: string
  Provincia: string
}
```

#### Comunidad Autónoma

```typescript
interface ComunidadAutonoma {
  IDCCAA: string
  CCAADescripcion: string
}
```

---

## 3. Arquitectura de la Aplicación

### 3.1 Estructura de Archivos

```
src/
├── api/                          # Capa de datos
│   ├── client.ts                 # Instancia Axios + interceptors
│   ├── endpoints/
│   │   ├── stations.ts           # Endpoints de gasolineras
│   │   ├── maritime.ts           # Postes marítimos
│   │   ├── products.ts           # Catálogo de productos
│   │   └── regions.ts            # Provincias, CCAA, municipios
│   └── types.ts                  # Tipos Zod
│
├── components/
│   ├── map/                      # Componentes del mapa
│   │   ├── GasStationMap.tsx     # Mapa principal
│   │   ├── StationMarkers.tsx    # Marcadores de gasolineras
│   │   ├── StationCluster.tsx    # Clusters de gasolineras
│   │   ├── CheapestMarker.tsx    # Marcador más barata
│   │   ├── ExpensiveMarker.tsx   # Marcador más cara
│   │   ├── MapControls.tsx       # Controles del mapa
│   │   └── MapStyleSelector.tsx   # Selector de estilo
│   │
│   ├── station/                  # Detalles de gasolinera
│   │   ├── StationDetail.tsx     # Panel de detalle
│   │   ├── StationInfo.tsx       # Información básica
│   │   ├── StationPrices.tsx     # Listado de precios
│   │   └── StationHistoryChart.tsx  # Gráfico histórico
│   │
│   ├── filters/                  # Sistema de filtros
│   │   ├── FuelSelector.tsx      # Selector de carburante
│   │   ├── RegionSelector.tsx    # Selector de región
│   │   └── TankCapacityInput.tsx # Capacidad depósito
│   │
│   ├── calculator/               # Calculadora
│   │   └── FuelCalculator.tsx    # Conversor € ↔ litros
│   │
│   ├── settings/                 # Panel de ajustes
│   │   ├── SettingsPanel.tsx     # Panel principal
│   │   ├── ThemeSelector.tsx     # Selector de tema
│   │   ├── MapStyleSelector.tsx  # Selector estilo mapa
│   │   └── PreferencesForm.tsx   # Formulario de preferencias
│   │
│   ├── ui/                       # Componentes shadcn/ui
│   │   └── [existing]
│   │
│   └── layout/
│       ├── Header.tsx            # Encabezado
│       ├── Sidebar.tsx           # Panel lateral (desktop)
│       ├── BottomSheet.tsx       # Panel inferior (móvil)
│       ├── MobileNav.tsx         # Navegación móvil
│       └── PriceThermometer.tsx   # Termómetro de precios
│
├── stores/                       # Estado global (Zustand)
│   ├── settingsStore.ts         # Ajustes de usuario
│   ├── filterStore.ts           # Filtros activos
│   ├── mapStore.ts             # Estado del mapa
│   └── stationStore.ts         # Gasolinera seleccionada
│
├── hooks/                       # Custom hooks
│   ├── useStations.ts           # Fetch gasolineras
│   ├── useMaritimeStations.ts   # Fetch postes marítimos
│   ├── useStationHistory.ts     # Fetch histórico
│   ├── useProducts.ts          # Fetch productos
│   ├── useRegions.ts           # Fetch regiones
│   ├── useMapBounds.ts         # Bounds del mapa
│   ├── usePriceThresholds.ts   # Percentiles dinámicos
│   ├── useCheapestStation.ts   # Gasolinera más barata
│   ├── useGeolocation.ts      # Geolocalización usuario
│   └── useLocalStorage.ts     # Persistencia
│
├── lib/                         # Utilidades
│   ├── constants.ts            # URLs API, configuraciones
│   ├── price-utils.ts         # Cálculos de precios
│   ├── fuel-types.ts          # Tipos de carburante
│   └── map-styles.ts          # Estilos de mapa
│
├── types/                       # Tipos TypeScript
│   └── index.ts               # Zod schemas + tipos
│
└── App.tsx                      # Componente principal
```

### 3.2 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                        TanStack Query                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ getStations  │  │ getProducts  │  │ getHistory  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └────────────┬────┴────────────────┘                │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────┐            │
│  │            React Query Cache                │            │
│  │         (staleTime: 1 hora)                 │            │
│  └─────────────────────┬───────────────────────┘            │
└────────────────────────┼─────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Zustand Stores                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Settings  │  │  Filters   │  │    Map     │              │
│  │  Store     │  │   Store    │  │   Store    │              │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
└────────┼───────────────┼───────────────┼──────────────────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Componentes React                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    GasStationMap                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │   │
│  │  │  Markers   │  │  Clusters  │  │  Popups   │       │   │
│  │  └────────────┘  └────────────┘  └────────────┘       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Stores Zustand

### 4.1 Settings Store

```typescript
interface SettingsState {
  theme: "light" | "dark" | "system"
  mapStyle: "osm-bright" | "osm-dark" | "liberty" | "fiord-color"
  defaultFuel: string
  tankCapacity: number
  autoCenterCheapest: boolean
  showMaritime: boolean

  setTheme: (theme: "light" | "dark" | "system") => void
  setMapStyle: (style: string) => void
  setDefaultFuel: (fuel: string) => void
  setTankCapacity: (capacity: number) => void
  setAutoCenterCheapest: (value: boolean) => void
  setShowMaritime: (value: boolean) => void
}
```

**Persistencia**: `gasEdd-settings` en localStorage

### 4.2 Filter Store

```typescript
interface FilterState {
  selectedFuel: string | null
  selectedProvince: string | null
  selectedCCAA: string | null
  selectedMunicipality: string | null
  tankCapacity: number

  setSelectedFuel: (fuel: string | null) => void
  setSelectedProvince: (province: string | null) => void
  setSelectedCCAA: (ccaa: string | null) => void
  setSelectedMunicipality: (municipality: string | null) => void
  setTankCapacity: (capacity: number) => void
  resetFilters: () => void
}
```

**Persistencia**: `gasEdd-filters` en localStorage

### 4.3 Map Store

```typescript
interface MapState {
  viewport: { lng: number; lat: number; zoom: number }
  bounds: [[number, number], [number, number]] | null
  selectedStationId: string | null
  isBlocked: boolean

  setViewport: (viewport: Viewport) => void
  setBounds: (bounds: Bounds) => void
  setSelectedStation: (id: string | null) => void
  setBlocked: (blocked: boolean) => void
}
```

### 4.4 Station Store

```typescript
interface StationState {
  hoveredStationId: string | null
  cheapestStationId: string | null
  expensiveStationId: string | null

  setHoveredStation: (id: string | null) => void
  setCheapestStation: (id: string | null) => void
  setExpensiveStation: (id: string | null) => void
}
```

---

## 5. Componentes Principales

### 5.1 GasStationMap

Mapa principal que integra mapcn con los datos de gasolineras.

**Props**: No tiene (usa stores globales)

**Funcionalidades**:

- Carga de gasolineras como GeoJSON source
- Clustering para rendimiento (~10,000 puntos)
- Actualización de marcadores según bounds visibles
- Geolocalización automática del usuario
- Centro inicial: España (40.416775, -3.703790)

### 5.2 StationMarkers

Marcadores inteligentes con código de colores.

**Lógica de colores**:

| Color    | Criterio        | RGB     |
| -------- | --------------- | ------- |
| Verde    | < percentil 33  | #22c55e |
| Amarillo | percentil 33-66 | #eab308 |
| Rojo     | > percentil 66  | #ef4444 |

**Marcadores especiales**:

- ⭐ Más barata de la vista (estrella verde)
- 🔴 Más cara de la vista (estrella roja)

### 5.3 FuelCalculator

Calculadora bidireccional de combustible.

**Inputs**:

- Euros (€) → resultado en litros
- Litros → resultado en euros

**Lógica**:

```typescript
const eurosToLiters = (euros: number, pricePerLiter: number) =>
  euros / pricePerLiters
const litersToEuros = (liters: number, pricePerLiter: number) =>
  liters * pricePerLiter
```

**Validaciones**:

- Capacidad máxima del depósito
- Mostrar aviso si excede

### 5.4 StationHistoryChart

Gráfico simple de histórico de precios.

**Características**:

- Últimos 30 días de datos
- Gráfico de líneas o barras
- Mostrar tendencia (subida/bajada)
- Tooltip con fecha y precio

### 5.5 PriceThermometer

Termómetro visual de precios en la vista actual.

**Cálculos**:

- Media de precios visibles
- Mediana de precios visibles
- Percentiles (33%, 66%)

**Visualización**:

- Barra vertical u horizontal
- Indicadores de rango

### 5.6 SettingsPanel

Panel de configuración de la aplicación.

**Ajustes disponibles**:

| Ajuste              | Tipo   | Valores                                    |
| ------------------- | ------ | ------------------------------------------ |
| Tema                | Select | light, dark, system                        |
| Estilo mapa         | Select | osm-bright, osm-dark, liberty, fiord-color |
| Mostrar marítimas   | Toggle | true/false                                 |
| Centro automático   | Toggle | true/false                                 |
| Carburante favorito | Select | [lista de productos]                       |
| Capacidad depósito  | Input  | 10-100 litros                              |

---

## 6. Estilos de Mapa (OpenFreeMap)

### 6.1 Estilos Disponibles

| Estilo      | URL                                                | Descripción          |
| ----------- | -------------------------------------------------- | -------------------- |
| osm-bright  | `https://tiles.openfreemap.org/styles/liberty`     | Estilo brillante OSM |
| osm-dark    | `https://tiles.openfreemap.org/styles/osm-bright`  | Estilo oscuro        |
| liberty     | `https://tiles.openfreemap.org/styles/liberty`     | Estilo liberty       |
| fiord-color | `https://tiles.openfreemap.org/styles/fiord-color` | Estilo fiordos       |

### 6.2 Integración con mapcn

```typescript
import { Map } from "@mapcn/map"

const MAP_STYLES = {
  "osm-bright": "https://tiles.openfreemap.org/styles/liberty",
  "osm-dark": "https://tiles.openfreemap.org/styles/osm-bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  "fiord-color": "https://tiles.openfreemap.org/styles/fiord-color",
}
```

---

## 7. Tipos de Carburante

### 7.1 Catálogo de Productos

Basado en los datos de `Listados/ProductosPetroliferos/`:

| ID  | Nombre                 | Abreviatura      |
| --- | ---------------------- | ---------------- |
| 1   | Gasolina 95 E5         | 95 E5            |
| 2   | Gasolina 95 E10        | 95 E10           |
| 3   | Gasolina 95 E25        | 95 E25           |
| 4   | Gasolina 95 E85        | 95 E85           |
| 5   | Gasolina 95 E5 Premium | 95 E5 Premium    |
| 6   | Gasolina 98 E5         | 98 E5            |
| 7   | Gasolina 98 E10        | 98 E10           |
| 8   | Gasolina Renovable     | Renovable        |
| 9   | Gasóleo A              | Gasóleo A        |
| 10  | Gasóleo B              | Gasóleo B        |
| 11  | Gasóleo Premium        | Gasóleo Premium  |
| 12  | Diésel Renovable       | Diésel Renovable |
| 13  | GLP                    | GLP              |
| 14  | GNC                    | GNC              |
| 15  | GNL                    | GNL              |

### 7.2 Carburantes Principales (por defecto)

- **Gasolina 95 E5** - Más común
- **Gasolina 98 E5** - Premium
- **Gasóleo A** - Diésel estándar
- **Gasóleo Premium** - Diüssel premium

---

## 8. Funcionalidades por Fase

### Fase 1: Infraestructura (2 días)

- [x] Configurar cliente Axios con base URL
- [x] Crear tipos Zod para todas las respuestas
- [x] Implementar todos los endpoints
- [x] Configurar TanStack Query
- [x] Crear stores Zustand con persistencia
- [x] Hook de geolocalización con permisos

### Fase 2: Mapa Base (2 días)

- [x] Configurar mapcn Map con OpenFreeMap
- [x] Añadir MapControls (zoom, locate-me)
- [x] Geolocalización automática
- [x] Centro inicial España
- [x] Pantalla de permiso de ubicación al iniciar

### Fase 3: Datos + Clustering (2 días)

- [x] Carga de gasolineras por provincia (52 peticiones)
- [x] Fetch de productos petrolíferos
- [x] Configurar GeoJSON source
- [x] Implementar clustering
- [x] Cache con staleTime: 1h
- [x] Detección automática de provincia por coordenadas

### Fase 4: Marcadores Inteligentes (2 días)

- [ ] Calcular percentiles dinámicos
- [ ] Colorear marcadores (verde/amarillo/rojo)
- [ ] Marcadores especiales (más barata/más cara)
- [ ] Tooltip con precio al hover

### Fase 5: Filtros (2 días)

- [ ] Selector de carburante
- [ ] Selector de provincia
- [ ] Selector de comunidad autónoma
- [ ] Input capacidad depósito
- [ ] URL query params

### Fase 6: Station Detail (2 días)

- [ ] Click en marcador → abrir detalle
- [ ] Mostrar información completa
- [ ] Botón "Fijar" para modo bloqueo
- [ ] Link navegación externa

### Fase 7: Histórico (2 días)

- [ ] Fetch histórico bajo demanda
- [ ] Gráfico de últimos 30 días
- [ ] Componente con Recharts

### Fase 8: Calculadora (1 día)

- [ ] Input € → litros
- [ ] Input litros → €
- [ ] Validar capacidad depósito

### Fase 9: Termómetro (1 día)

- [ ] Calcular media/mediana
- [ ] Visualización termómetro
- [ ] Actualizar al mover mapa

### Fase 10: Settings (2 días)

- [ ] Panel de ajustes
- [ ] Selector de tema
- [ ] Selector estilo mapa
- [ ] Toggle marítimas
- [ ] Persistencia localStorage

### Fase 11: PWA (1 día)

- [ ] Configurar vite-plugin-pwa
- [ ] Service worker
- [ ] Offline fallback
- [ ] Install prompt

### Fase 12: Responsive (2 días)

- [ ] Layout desktop (sidebar)
- [ ] Layout mobile (bottom sheet)
- [ ] Animaciones Motion
- [ ] Transiciones suaves

---

## 9. Rendimiento

### 9.1 Estrategias de Optimización

| Técnica        | Aplicación               |
| -------------- | ------------------------ |
| Clustering     | MapLibre GL nativo       |
| Virtualización | react-window para listas |
| Memoización    | useMemo/useCallback      |
| Caching        | TanStack Query (1h)      |
| Lazy loading   | React.lazy()             |
| GeoJSON        | Solo coordenadas         |

### 9.2 Límites y Thresholds

| Métrica                | Valor             |
| ---------------------- | ----------------- |
| Estaciones en cache    | ~10,000           |
| Clustering zoom        | < 12              |
| staleTime API          | 3,600,000 ms (1h) |
| Tiempo request timeout | 10,000 ms         |

---

## 10. Responsive Design

### 10.1 Breakpoints

| Breakpoint | Ancho      | Layout                            |
| ---------- | ---------- | --------------------------------- |
| sm         | < 640px    | Mobile full screen + bottom sheet |
| md         | 640-1024px | Tablet sidebar collapsible        |
| lg         | > 1024px   | Desktop sidebar fixed             |

### 10.2 Componentes Responsive

| Componente     | Desktop         | Mobile          |
| -------------- | --------------- | --------------- |
| Station Detail | Sidebar derecha | Bottom sheet    |
| Filters        | Sidebar         | Modal/Drawer    |
| Calculator     | Panel fijo      | Floating button |
| Settings       | Modal           | Full screen     |

---

## 11. PWA Configuration

### 11.1 vite-plugin-pwa

```typescript
import { VitePWA } from "vite-plugin-pwa"

export default VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "icons.svg"],
  manifest: {
    name: "GasEdd - Precios Carburantes",
    short_name: "GasEdd",
    description: "Encuentra las gasolineras más barato",
    theme_color: "#22c55e",
    background_color: "#ffffff",
    display: "standalone",
    icons: [
      {
        src: "icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/sedeaplicaciones\.minetur\.gob\.es\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 3600,
          },
        },
      },
    ],
  },
})
```

---

## 12. Testing

### 12.1 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Typecheck
npm run typecheck
```

---

## 13. API Reference

### 13.1 Base URL

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes
```

### 13.2 Endpoints Completos

```
GET  /EstacionesTerrestres/
GET  /EstacionesTerrestres/FiltroCCAA/{IDCCAA}
GET  /EstacionesTerrestres/FiltroCCAAProducto/{IDCCAA}/{IDProducto}
GET  /EstacionesTerrestres/FiltroMunicipio/{IDMunicipio}
GET  /EstacionesTerrestres/FiltroMunicipioProducto/{IDMunicipio}/{IDProducto}
GET  /EstacionesTerrestres/FiltroProducto/{IDProducto}
GET  /EstacionesTerrestres/FiltroProvincia/{IDProvincia}
GET  /EstacionesTerrestres/FiltroProvinciaProducto/{IDProvincia}/{IDProducto}
GET  /EstacionesTerrestresHist/{FECHA}
GET  /EstacionesTerrestresHist/FiltroCCAA/{FECHA}/{IDCCAA}
GET  /EstacionesTerrestresHist/FiltroCCAAProducto/{FECHA}/{IDCCAA}/{IDProducto}
GET  /EstacionesTerrestresHist/FiltroMunicipio/{FECHA}/{IDMunicipio}
GET  /EstacionesTerrestresHist/FiltroMunicipioProducto/{FECHA}/{IDMunicipio}/{IDProducto}
GET  /EstacionesTerrestresHist/FiltroProducto/{FECHA}/{IDProducto}
GET  /EstacionesTerrestresHist/FiltroProvincia/{FECHA}/{IDProvincia}
GET  /EstacionesTerrestresHist/FiltroProvinciaProducto/{FECHA}/{IDProvincia}/{IDProducto}
GET  /PostesMaritimos/
GET  /PostesMaritimos/FiltroCCAA/{IDCCAA}
GET  /PostesMaritimos/FiltroCCAAProducto/{IDCCAA}/{IDProducto}
GET  /PostesMaritimos/FiltroMunicipio/{IDMunicipio}
GET  /PostesMaritimos/FiltroMunicipioProducto/{IDMunicipio}/{IDProducto}
GET  /PostesMaritimos/FiltroProducto/{IDProducto}
GET  /PostesMaritimos/FiltroProvincia/{IDProvincia}
GET  /PostesMaritimos/FiltroProvinciaProducto/{IDProvincia}/{IDProducto}
GET  /Listados/ComunidadesAutonomas/
GET  /Listados/Municipios/
GET  /Listados/MunicipiosPorProvincia/{IDProvincia}
GET  /Listados/ProductosPetroliferos/
GET  /Listados/Provincias/
GET  /Listados/ProvinciasPorComunidad/{IDCCAA}
```

---

## 14. Historial de Cambios

| Versión | Fecha | Descripción            |
| ------- | ----- | ---------------------- |
| 1.0.0   | -     | Creación del documento |
