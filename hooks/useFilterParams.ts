// src/hooks/useFilterParams.ts
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para leer y actualizar los filtros en los URL Search Params.
 * @returns [getValue: (key: string) => string | string[] | null, setValue: (key: string, value: string | string[] | null) => void, clearAll: () => void]
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Función para obtener el valor de un filtro (maneja strings simples o arrays)
  const getParamValue = useCallback(
    (key: string): string | string[] | null => {
      const allValues = searchParams.getAll(key);
      if (allValues.length === 0) return null;
      // Para select-single, devolvemos el primer valor
      if (allValues.length === 1) return allValues[0];
      // Para select-multiple, devolvemos el array completo
      return allValues;
    },
    [searchParams],
  );

  // Función para crear un nuevo conjunto de search params
  const createQueryString = useCallback(
    (name: string, value: string | string[] | null, currentParams: URLSearchParams) => {
      const params = new URLSearchParams(currentParams.toString());
      params.delete(name);

      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(name, v));
        } else {
          params.set(name, value);
        }
      }
      return params.toString();
    },
    [],
  );

  // Función para establecer el valor de un filtro
  const setParamValue = useCallback(
    (key: string, value: string | string[] | null) => {
      const newQueryString = createQueryString(key, value, searchParams);

      // Reemplazamos la URL para evitar llenar el historial
      router.replace(pathname + "?" + newQueryString, { scroll: false });
    },
    [searchParams, router, pathname, createQueryString],
  );

  // Función para limpiar todos los filtros
  const clearAllParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    getValue: getParamValue,
    setValue: setParamValue,
    clearAll: clearAllParams,
    searchParams,
  };
}
