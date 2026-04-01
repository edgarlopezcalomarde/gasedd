# GasEdd 

## 1. Resumen del Proyecto

**GasEdd** es una aplicación web progresiva (PWA) para consultar precios de carburantes en España. Utiliza la API pública del Ministerio de Asuntos Económicos y Transformación Digital para obtener datos en tiempo real de gasolineras terrestres y marítimas.

### Objetivos Principales

- Mostrar gasolineras en un mapa interactivo con precios en tiempo real
- Identificar gasolineras más baratas y más caras de la zona visible
- Sistema de colores inteligentes según rangos de precios
- Filtrado por tipo de carburante y ubicación
- Calculadora de combustible (€ ↔ litros)
- Aplicación 100% responsive (desktop + móvil)

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


#### Base URL

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes
```

#### Endpoints Completos

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

## 3. Tipos de Carburante

### 3.1 Catálogo de Productos

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

### 3.2 Carburantes Principales (por defecto)

- **Gasolina 95 E5** - Más común
- **Gasolina 98 E5** - Premium
- **Gasóleo A** - Diésel estándar
- **Gasóleo Premium** - Diüssel premium


