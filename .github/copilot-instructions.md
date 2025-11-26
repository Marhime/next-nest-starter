# GitHub Copilot Instructions

## Project Overview

This is a **full-stack property rental/sale platform** built with:

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, Prisma, PostgreSQL, Better Auth
- **State Management**: Zustand with persist middleware
- **Data Fetching**: React Query (TanStack Query)
- **Monorepo**: Turborepo with apps/packages structure

## Core Architecture Principles

### 1. Single Source of Truth

- **ONE unified Zustand store** (`search-store.ts`) for:
  - Search filters (listing type, price, bedrooms, amenities)
  - Properties data
  - Map state (center, zoom, bounds)
  - UI state (sidebar, selected property)
- ❌ **NEVER** create duplicate stores for the same domain
- ✅ **ALWAYS** use the existing unified store

### 2. State Management Pattern

```typescript
// ✅ CORRECT: Use unified store
import { useSearchStore } from '@/stores/search-store';

export function MyComponent() {
  const { properties, setProperties, minPrice, setMinPrice } = useSearchStore();
  // ...
}

// ❌ WRONG: Don't create separate stores
import { usePropertyStore } from '@/stores/property-store'; // DON'T DO THIS
```

### 3. Data Fetching with React Query

```typescript
// ✅ CORRECT: Query key based on filters
const query = useQuery({
  queryKey: ['properties', { listingType, minPrice, maxPrice, mapBounds }],
  queryFn: () =>
    fetchProperties({ listingType, minPrice, maxPrice, mapBounds }),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
});

// ❌ WRONG: Static query key
const query = useQuery({
  queryKey: ['properties'], // No dependency on filters
  queryFn: fetchProperties,
});
```

### 4. URL Persistence Pattern

```typescript
// ✅ CORRECT: Bidirectional sync with guard
const hasInitializedRef = useRef(false);

// 1. URL → Store (once on mount)
useEffect(() => {
  if (!hasInitializedRef.current) {
    setFiltersFromURL(searchParams);
    hasInitializedRef.current = true;
  }
}, [searchParams, setFiltersFromURL]);

// 2. Store → URL (on filter changes)
useEffect(() => {
  if (!hasInitializedRef.current) return;

  const params = toURLParams();
  const newSearch = params.toString();
  const currentSearch = window.location.search.replace('?', '');

  if (newSearch !== currentSearch) {
    window.history.replaceState({}, '', `${pathname}?${newSearch}`);
  }
}, [listingType, minPrice, maxPrice, ...otherFilters, toURLParams]);
```

### 5. Backend API Patterns

#### Controller

```typescript
// ✅ CORRECT: Parse query params with ValidationPipe auto-transform
@Get()
@AllowAnonymous()
findAll(@Query() query: QueryPropertyDto) {
  return this.propertiesService.findAll(query);
}

// ❌ WRONG: Manual parsing
@Get()
findAll(
  @Query('minPrice') minPriceStr?: string,
  @Query('maxPrice') maxPriceStr?: string,
) {
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  // Manual conversion is error-prone
}
```

#### Service

```typescript
// ✅ CORRECT: Convert numbers to Decimal strings for Prisma
if (minPrice !== undefined) {
  priceFilter.gte = String(minPrice); // Prisma Decimal expects string
}

// ❌ WRONG: Pass raw numbers
priceFilter.gte = minPrice; // Will fail with Decimal columns
```

### 6. Component Patterns

#### Reusable Components

```typescript
// ✅ CORRECT: Props-based for reusability
interface AdvancedFiltersProps {
  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
}

export function AdvancedFilters({
  onClose,
  showHeader,
  className,
}: AdvancedFiltersProps) {
  const { minPrice, setMinPrice } = useSearchStore();
  // Component logic
}

// ❌ WRONG: Hardcoded behavior
export function AdvancedFilters() {
  // No props, can't be customized
}
```

#### Smart vs Presentational

```typescript
// ✅ Smart Component (data + logic)
export function PropertyList() {
  const { properties, isLoading } = useSearchStore();
  usePropertyData(); // Fetch data

  return <div>{properties.map(p => <PropertyCard property={p} />)}</div>;
}

// ✅ Presentational Component (UI only)
interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return <div>{property.title}</div>;
}
```

## File Organization Rules

### Frontend Structure

```
apps/web/
├── app/
│   └── [locale]/
│       ├── (public)/          # Public pages (home, search)
│       └── (authenticated)/    # Protected pages (dashboard)
├── components/
│   ├── shared/                # Reusable across app (LocationSearchBar)
│   ├── search/                # Search-specific (AdvancedFilters, ModernSearchBar)
│   ├── property-search/       # Map search (PropertyMap, PropertyCard)
│   └── ui/                    # shadcn components
├── stores/
│   └── search-store.ts        # ⚠️ THE SINGLE SOURCE OF TRUTH
├── hooks/
│   └── use-property-data.ts   # React Query hooks
└── lib/
    ├── utils.ts               # Utility functions
    └── constants.ts           # App constants
```

### Backend Structure

```
apps/api/src/
├── properties/
│   ├── properties.controller.ts  # HTTP endpoints
│   ├── properties.service.ts     # Business logic
│   └── dto/                      # Data Transfer Objects
├── users/
├── auth/
└── prisma/
    └── prisma.service.ts
```

## Naming Conventions

### TypeScript/JavaScript

- **Components**: PascalCase (`PropertyCard`, `ModernSearchBar`)
- **Files**: kebab-case (`property-card.tsx`, `use-property-data.ts`)
- **Hooks**: camelCase with `use` prefix (`usePropertyData`, `useSearchStore`)
- **Types/Interfaces**: PascalCase (`Property`, `SearchFilters`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `DEFAULT_ZOOM`)

### Backend

- **Entities**: PascalCase (`Property`, `User`)
- **DTOs**: PascalCase with suffix (`CreatePropertyDto`, `QueryPropertyDto`)
- **Services**: PascalCase with suffix (`PropertiesService`, `UsersService`)

## TypeScript Best Practices

### Strict Type Safety

```typescript
// ✅ CORRECT: Explicit types
interface Property {
  id: number;
  title: string;
  price?: number;
}

export function PropertyCard({ property }: { property: Property }) {
  // ...
}

// ❌ WRONG: Any types
export function PropertyCard({ property }: { property: any }) {
  // Loses type safety
}
```

### Type Exports

```typescript
// ✅ CORRECT: Export types from store
export interface Property {
  id: number;
  // ...
}

export type ListingType = 'SALE' | 'RENT' | 'SHORT_TERM' | null;

// Import in components
import { type Property, type ListingType } from '@/stores/search-store';
```

## Performance Optimization

### Memoization

```typescript
// ✅ CORRECT: useMemo for expensive computations
const filteredProperties = useMemo(
  () => properties.filter((p) => p.price >= minPrice),
  [properties, minPrice],
);

// ✅ CORRECT: useCallback for event handlers passed to children
const handleSelect = useCallback(
  (id: number) => {
    selectProperty(id);
  },
  [selectProperty],
);
```

### Debouncing

```typescript
// ✅ CORRECT: Debounce map bounds updates
const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const map = useMapEvents({
  moveend: () => {
    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }

    boundsTimeoutRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }, 500); // 500ms debounce
  },
});
```

## API Design Rules

### RESTful Endpoints

```
GET    /properties              - List with filters
GET    /properties/:id          - Get one
POST   /properties              - Create
PATCH  /properties/:id          - Update
DELETE /properties/:id          - Delete
GET    /properties/nearby       - Geospatial search
```

### Query Parameters

```typescript
// ✅ CORRECT: Optional with defaults
@Query() query: QueryPropertyDto {
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  page?: number = 1;
  limit?: number = 20;
}
```

### Response Format

```typescript
// ✅ CORRECT: Consistent response structure
{
  data: Property[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

## Security Practices

### Authentication

```typescript
// ✅ CORRECT: Use Better Auth guards
@UseGuards(AuthGuard)
@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdatePropertyDto,
  @Session() session: UserSession,
) {
  // Verify ownership in service
  return this.service.update(id, dto, session.user.id);
}

// ✅ Public endpoints need explicit decorator
@AllowAnonymous()
@Get()
findAll() { }
```

### Input Validation

```typescript
// ✅ CORRECT: Use class-validator decorators
export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;
}
```

## Error Handling

### Frontend

```typescript
// ✅ CORRECT: Handle loading/error states
const { data, isLoading, error } = useQuery({
  queryKey: ['properties'],
  queryFn: fetchProperties,
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <PropertyList properties={data} />;
```

### Backend

```typescript
// ✅ CORRECT: Throw NestJS exceptions
if (!property) {
  throw new NotFoundException(`Property with ID ${id} not found`);
}

if (property.userId !== userId) {
  throw new ForbiddenException(
    'You do not have permission to update this property',
  );
}
```

## Testing Guidelines

### Component Tests

```typescript
// ✅ Test user interactions
it('should update filters when user changes price', () => {
  render(<AdvancedFilters />);

  const minPriceInput = screen.getByLabelText('Prix minimum');
  fireEvent.change(minPriceInput, { target: { value: '100000' } });

  expect(useSearchStore.getState().minPrice).toBe(100000);
});
```

### API Tests

```typescript
// ✅ E2E test with real data
it('should filter properties by price', () => {
  return request(app.getHttpServer())
    .get('/properties?minPrice=100000&maxPrice=500000')
    .expect(200)
    .expect((res) => {
      expect(res.body.data).toHaveLength(5);
      expect(res.body.data[0].price).toBeGreaterThanOrEqual(100000);
    });
});
```

## Documentation Requirements

### Component Documentation

```typescript
/**
 * Modern Search Bar for Home Page
 *
 * Features:
 * - Listing type selector (Buy/Rent/Vacation)
 * - Geocoding with LocationSearchBar
 * - Popular city shortcuts
 * - Navigates to /find with URL params
 *
 * @example
 * <ModernSearchBar />
 */
export function ModernSearchBar() {}
```

### Function Documentation

```typescript
/**
 * Fetch properties with filters and map bounds
 *
 * @param params - Search filters (listing type, price, bedrooms, etc.)
 * @returns Promise<Property[]> - Filtered properties
 *
 * @remarks
 * - Uses /properties/nearby if mapBounds provided
 * - Falls back to /properties for simple searches
 * - Automatically refetches when params change (React Query)
 */
async function fetchProperties(
  params: FetchPropertiesParams,
): Promise<Property[]> {}
```

## Common Mistakes to Avoid

### ❌ Don't Do This

1. **Multiple stores for same domain**

```typescript
// ❌ WRONG
const { properties } = usePropertyStore();
const { filters } = useFilterStore();
// These should be in ONE store
```

2. **Client-side filtering after API fetch**

```typescript
// ❌ WRONG: Fetches all, filters client-side
const allProperties = await fetch('/properties');
const filtered = allProperties.filter((p) => p.price > minPrice);

// ✅ CORRECT: Server-side filtering
const filtered = await fetch(`/properties?minPrice=${minPrice}`);
```

3. **Prop drilling**

```typescript
// ❌ WRONG: Passing through multiple levels
<Parent property={property}>
  <Child property={property}>
    <GrandChild property={property} />
  </Child>
</Parent>

// ✅ CORRECT: Use store or context
const { selectedProperty } = useSearchStore();
```

4. **Duplicate API calls**

```typescript
// ❌ WRONG: Multiple components fetching same data
function ComponentA() {
  const { data } = useQuery(['properties'], fetchProperties);
}
function ComponentB() {
  const { data } = useQuery(['properties'], fetchProperties);
}

// ✅ CORRECT: React Query caches, but fetch in one place
function ParentComponent() {
  usePropertyData(); // Fetches and updates store
  return <><ComponentA /><ComponentB /></>;
}
```

## Git Commit Guidelines

### Commit Message Format

```
type(scope): brief description

Detailed explanation (optional)

BREAKING CHANGE: description (if applicable)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure without behavior change
- `perf`: Performance improvement
- `docs`: Documentation
- `test`: Adding tests
- `chore`: Build/tooling changes

### Examples

```bash
feat(search): add unified Zustand store for search state
fix(api): convert price to Decimal string for Prisma
refactor(map): debounce bounds updates to 500ms
perf(query): optimize React Query cache strategy
```

## When to Update This File

Update these instructions when:

- ✅ Adding a new major architectural pattern
- ✅ Introducing a new technology/library
- ✅ Changing state management approach
- ✅ Discovering a common mistake pattern
- ✅ Establishing new coding conventions

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] Using unified `search-store` (not creating duplicate stores)
- [ ] React Query keys include all dependencies
- [ ] URL sync has infinite loop protection
- [ ] Backend converts numbers to Decimal strings for Prisma
- [ ] Components are typed (no `any`)
- [ ] Debouncing expensive operations (map, geocoding)
- [ ] Props-based design for reusability
- [ ] Error states handled gracefully
- [ ] Tests written for critical paths
- [ ] Documentation updated

---

**Last Updated**: November 2025
**Version**: 1.0.0
