'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface UrlSearchInputProps {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
}

export function UrlSearchInput({
  placeholder = 'Buscar registros...',
  paramKey = 'search',
  debounceMs = 300,
  onSearch,
}: UrlSearchInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [localValue, setLocalValue] = useState(searchParams.get(paramKey) || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlValue = searchParams.get(paramKey) || '';
    setLocalValue(urlValue);
  }, [searchParams, paramKey]);

  const updateUrl = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set(paramKey, value.trim());
    } else {
      params.delete(paramKey);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
    onSearch?.(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateUrl(value);
    }, debounceMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      updateUrl(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    updateUrl('');
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      <span className="absolute left-3 text-muted-foreground">
        <Search className="h-4 w-4" />
      </span>
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="max-w-sm pl-9 pr-8 focus:ring-2 focus:ring-primary/40 transition-all duration-150"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 h-8 w-8 p-0"
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
