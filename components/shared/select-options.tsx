'use client';

import * as React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

export type Option = {
  value: string;
  label: string;
  subtitle?: string;
};

interface SelectOptionsProps {
  items?: any[];
  options?: Option[];
  value?: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
  valueKey?: string;
  labelKey?: string;
  subtitleKey?: string;
  onSearch?: (term: string) => void;
  noneOption?: Option;
  loading?: boolean;
  createOption?: {
    label: string;
    onCreate: () => void;
  };
}

export function SelectOptions({
  items,
  options = [],
  value,
  onChange,
  placeholder = 'Selecciona...',
  multiple = false,
  searchable = false,
  className,
  valueKey,
  labelKey,
  subtitleKey,
  noneOption = { value: 'none', label: 'Ninguno' },
  onSearch,
  loading = false,
  createOption,
}: SelectOptionsProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const resolvedOptions = React.useMemo<Option[]>(() => {
    if (items && items.length > 0) {
      const vKey = valueKey ?? 'id';
      const lKey = labelKey ?? 'name';
      const sKey = subtitleKey ?? 'email';
      return items.map((it) => ({
        value: String(it[vKey] ?? it.value ?? ''),
        label: String(it[lKey] ?? it.label ?? ''),
        subtitle: (it[sKey] ?? it.subtitle ?? undefined) as string | undefined,
      }));
    }
    return options;
  }, [items, options, valueKey, labelKey, subtitleKey]);

  React.useEffect(() => {
    if (!onSearch || !searchable) return;
    const term = search.trim();
    if (!term) return;

    const id = setTimeout(() => onSearch(term), 300);
    return () => clearTimeout(id);
  }, [search, onSearch, searchable]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return resolvedOptions;
    return resolvedOptions.filter(
      (o) => o.label.toLowerCase().includes(term) || o.subtitle?.toLowerCase().includes(term)
    );
  }, [resolvedOptions, search]);
  const handleSelect = (val: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const newValues = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      onChange(newValues.length ? newValues : null);
    } else {
      onChange(val === noneOption.value ? null : val);
      setOpen(false);
    }
  };

  const isSelected = (val: string) => (Array.isArray(value) ? value.includes(val) : value === val);

  const displayValue = React.useMemo(() => {
    if (multiple) {
      const vals = Array.isArray(value) ? value : [];
      if (vals.length === 0) return placeholder;
      if (vals.length === 1) {
        const label = resolvedOptions.find((o) => o.value === vals[0])?.label;
        return label ?? placeholder;
      }
      return `${vals.length} seleccionados`;
    }
    if (!value) return placeholder;
    const label = resolvedOptions.find((o) => o.value === value)?.label;
    return label ?? placeholder;
  }, [value, multiple, resolvedOptions, placeholder]);

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full flex items-center  justify-between"
          >
            <span
              className={cn(
                !value || (Array.isArray(value) && value.length === 0)
                  ? 'text-muted-foreground'
                  : 'truncate max-w-lg'
              )}
            >
              {displayValue}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="max-h-[300px] overflow-y-auto "
          onWheel={(e) => e.stopPropagation()}
        >
          <Command>
            {searchable && (
              <div className="flex h-9 items-center gap-2 border-b px-3">
                <Search className="size-4 shrink-0 opacity-50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Buscar ${placeholder.toLowerCase()}...`}
                  className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}
            <CommandEmpty>{loading ? 'Cargando...' : 'No se encontraron resultados'}</CommandEmpty>
            <CommandGroup>
              {!multiple && (
                <CommandItem
                  value={noneOption.value}
                  onSelect={() => handleSelect(noneOption.value)}
                >
                  {noneOption.label}
                </CommandItem>
              )}
              {filtered.map((o) => (
                <CommandItem
                  key={o.value}
                  onSelect={() => handleSelect(o.value)}
                  className="cursor-pointer"
                >
                  {multiple && (
                    <Checkbox
                      checked={isSelected(o.value)}
                      onCheckedChange={() => handleSelect(o.value)}
                      className="mr-2 h-4 w-4"
                      tabIndex={-1}
                    />
                  )}
                  <div>
                    <div>{o.label}</div>
                    {o.subtitle && (
                      <div className="text-xs text-muted-foreground">{o.subtitle}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
              {createOption && (
                <CommandItem className="cursor-pointer border-t mt-2 pt-2" asChild>
                  <button
                    type="button"
                    onClick={() => {
                      createOption.onCreate();
                      setOpen(false);
                    }}
                    className="flex items-center w-full"
                  >
                    <span className="text-blue-600 font-medium">+ {createOption.label}</span>
                  </button>
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SelectOptions;
