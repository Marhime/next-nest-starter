# 🚀 Guía de Inicio Rápido - Sitio Inmobiliario Puerto Escondido

## ✅ Cambios completados

1. **✅ Datos mexicanos** - Ciudades de Puerto Escondido, Oaxaca
2. **✅ Precios en MXN** - Pesos mexicanos (3k-25k MXN renta, 800k-15M MXN venta)
3. **✅ Traducciones completas** - Español (predeterminado), Inglés, Francés
4. **✅ Componentes internationalizados** - `SearchFiltersModal` y `SearchFiltersButton`

---

## 🎯 Próximos pasos

### 1. Conectar la base de datos

```bash
# Iniciar PostgreSQL (si usas Docker)
docker-compose up -d postgres

# O configurar DATABASE_URL en .env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/starter_next_nest"
```

### 2. Aplicar las migraciones

```bash
cd apps/api
npx prisma migrate deploy
# O
npx prisma db push
```

### 3. Poblar la base de datos

**Opción A: Seed completo (base vacía)**

```bash
cd apps/api
npm run seed
```

**Opción B: Migración SQL (datos existentes)**

```bash
psql -U postgres -d starter_next_nest -f apps/api/prisma/migrate-to-mexican-data.sql
```

### 4. Iniciar el proyecto

```bash
# Desde la raíz del proyecto
npm run dev

# O por separado:
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

---

## 🧪 Probar el sitio

### Visitar:

- **Español**: http://localhost:3000 (predeterminado)
- **English**: http://localhost:3000/en
- **Français**: http://localhost:3000/fr

### Probar funcionalidades:

#### 1. Búsqueda básica (página de inicio)

- ✅ Clic en barra de búsqueda compacta
- ✅ Seleccionar "Comprar" o "Rentar"
- ✅ Buscar ubicación (ej: "Puerto Escondido")
- ✅ Establecer presupuesto en MXN
- ✅ Clic en "Buscar"

#### 2. Filtros avanzados (página /find)

- ✅ Clic en botón "Filtros"
- ✅ Seleccionar tipo de propiedad (Departamento, Casa, Terreno, etc.)
- ✅ Para Terreno: No muestra recámaras/baños, solo superficie
- ✅ Para otros tipos: Muestra recámaras y baños
- ✅ Aplicar filtros

#### 3. Cambio de idioma

- ✅ Clic en selector de idioma (ES/EN/FR)
- ✅ Verificar que todo el texto cambie
- ✅ Filtros, placeholders, botones traducidos

#### 4. Verificar datos

- ✅ Propiedades muestran ciudades mexicanas
- ✅ Precios en MXN (no EUR)
- ✅ Coordenadas en Oaxaca
- ✅ Filtro "Comprar" solo muestra propiedades en VENTA
- ✅ Filtro "Rentar" solo muestra propiedades en RENTA

---

## 📱 Responsive

El sistema funciona en:

- ✅ **Móvil**: Drawer (desliza desde abajo)
- ✅ **Desktop**: Modal (centro de pantalla)
- ✅ **Tablet**: Se adapta automáticamente (breakpoint: 768px)

---

## 🐛 Solución de problemas

### ❌ Error: ECONNREFUSED al hacer seed

**Solución**: La base de datos no está corriendo

```bash
# Verifica PostgreSQL
docker-compose up -d postgres
# O inicia tu servidor PostgreSQL local
```

### ❌ Los filtros no funcionan

**Solución**: Revisa que hayas aplicado el seed o la migración SQL

```bash
# Opción A: Re-seed
cd apps/api && npm run seed

# Opción B: Verificar datos
psql -U postgres -d starter_next_nest
SELECT "listingType", COUNT(*) FROM "Property" GROUP BY "listingType";
# Debe mostrar SALE y RENT (no SHORT_TERM)
```

### ❌ Precios en EUR en lugar de MXN

**Solución**: Aplicar script de migración

```bash
psql -U postgres -d starter_next_nest -f apps/api/prisma/migrate-to-mexican-data.sql
```

### ❌ Ciudades francesas en lugar de mexicanas

**Solución**: Aplicar script de migración o re-seed

```bash
# Verificar ciudades actuales
psql -U postgres -d starter_next_nest
SELECT city, COUNT(*) FROM "Property" GROUP BY city;

# Si muestra ciudades francesas, aplicar migración
\i apps/api/prisma/migrate-to-mexican-data.sql
```

---

## 📚 Documentación completa

Para más detalles, ver:

- **`MEXICAN_DATA_MIGRATION.md`** - Documentación completa de cambios
- **`copilot-instructions.md`** - Guía de desarrollo del proyecto
- **`UNIFIED_SEARCH_MODAL_ARCHITECTURE.md`** - Arquitectura del sistema de búsqueda

---

## 🎉 ¡Listo!

Ahora tienes un sitio inmobiliario totalmente funcional para Puerto Escondido, Oaxaca con:

- 🌴 Datos realistas mexicanos
- 💰 Precios en pesos mexicanos (MXN)
- 🌍 Interfaz multilingüe (ES/EN/FR)
- 🎯 Filtros precisos (Comprar/Rentar)
- 📱 Responsive (móvil y desktop)

---

## 💡 Consejos adicionales

### Personalizar ciudades

Edita `apps/api/prisma/seed.ts`:

```typescript
const cities = [
  'Puerto Escondido',
  'Tu Ciudad',
  // ... más ciudades
];
```

### Ajustar rangos de precios

Edita `apps/api/prisma/seed.ts`:

```typescript
monthlyPrice: faker.number.float({
  min: 3000, // Ajusta aquí
  max: 25000, // Ajusta aquí
});
```

### Agregar más tipos de propiedad

1. Agregar en `apps/api/prisma/schema.prisma`
2. Agregar traducciones en `messages/{es,en,fr}.json`
3. Agregar en `apps/web/components/search/SearchFiltersModal.tsx`

---

**¡Buena suerte con tu proyecto inmobiliario! 🏖️🇲🇽**
