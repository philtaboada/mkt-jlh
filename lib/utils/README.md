# Table Column Helpers

Este módulo proporciona helpers para crear columnas de tabla reutilizables y consistentes usando TanStack Table.

## Funciones Disponibles

### `createSortableColumn<TData>(key, label, cellRenderer?)`

Crea una columna ordenable con un botón de ordenamiento.

```tsx
createSortableColumn('name', 'Nombre');
createSortableColumn('age', 'Edad', (value) => `${value} años`);
```

### `createBadgeColumn<TData>(key, label, colorMap, formatter?)`

Crea una columna con badges coloreados.

```tsx
const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
};

createBadgeColumn('status', 'Estado', statusColors, (value) => value.toUpperCase());
```

### `createAvatarColumn<TData>(key, label, options)`

Crea una columna con avatar y información del usuario.

```tsx
createAvatarColumn('first_name', 'Usuario', {
  primaryField: 'first_name',
  secondaryField: 'last_name',
  subtitleField: 'email',
  avatarField: 'avatar_url', // opcional
});
```

### `createActionsColumn<TData>(actions)`

Crea una columna de acciones con un menú desplegable.

```tsx
createActionsColumn([
  {
    label: 'Editar',
    onClick: (row) => handleEdit(row),
  },
  {
    label: 'Eliminar',
    onClick: (row) => handleDelete(row.id),
    variant: 'destructive',
    separator: true,
  },
]);
```

### `createProgressColumn<TData>(key, label, options?)`

Crea una columna con barra de progreso.

```tsx
createProgressColumn('score', 'Puntuación', {
  showValue: true,
  color: 'bg-blue-500',
});
```

### `createCurrencyColumn<TData>(key, label)`

Crea una columna para valores monetarios.

```tsx
createCurrencyColumn('price', 'Precio');
```

### `createDateColumn<TData>(key, label, options?)`

Crea una columna para fechas.

```tsx
createDateColumn('created_at', 'Fecha de Creación', {
  format: 'long', // 'short' | 'long'
});
```

## Ejemplo de Uso Completo

```tsx
import {
  createSortableColumn,
  createBadgeColumn,
  createAvatarColumn,
  createActionsColumn,
} from '@/lib/utils/tableColumns';

const columns: ColumnDef<User>[] = [
  createAvatarColumn('first_name', 'Usuario', {
    primaryField: 'first_name',
    secondaryField: 'last_name',
    subtitleField: 'email',
  }),
  createSortableColumn('role', 'Rol'),
  createBadgeColumn('status', 'Estado', statusColors),
  createActionsColumn([
    { label: 'Editar', onClick: handleEdit },
    { label: 'Eliminar', onClick: handleDelete, variant: 'destructive' },
  ]),
];
```

## Beneficios

- **Consistencia**: Todas las columnas siguen el mismo patrón de diseño
- **Reutilización**: Los helpers pueden usarse en múltiples tablas
- **Mantenibilidad**: Cambios en el diseño se aplican automáticamente
- **Type Safety**: Soporte completo de TypeScript
- **Flexibilidad**: Los helpers aceptan opciones de personalización

## Personalización

Cada helper acepta opciones para personalizar el comportamiento:

- `createSortableColumn`: Acepta un `cellRenderer` opcional para personalizar cómo se muestra el contenido
- `createBadgeColumn`: Requiere un `colorMap` y opcionalmente un `formatter`
- `createAvatarColumn`: Configurable con campos específicos para nombre, apellido, subtítulo y avatar
- `createActionsColumn`: Array de acciones con opciones de variante y separadores
- `createProgressColumn`: Opciones para mostrar/ocultar valor y color personalizado
- `createCurrencyColumn`: Formato automático de moneda
- `createDateColumn`: Formatos corto y largo disponibles

## Integración con Enums

Los helpers funcionan perfectamente con enums y funciones de formateo:

```tsx
import { getLeadStatusLabel, getLeadSourceLabel } from '@/lib/schemas/leadSchemas';

createBadgeColumn('status', 'Estado', statusColors, getLeadStatusLabel);
```
