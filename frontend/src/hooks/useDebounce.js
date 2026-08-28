import { useState, useEffect } from 'react';

/**
 * Hook de debounce para retrasar la actualización de un valor hasta que el usuario deje de escribir.
 * @param {any} value Valor a retrasar.
 * @param {number} delay Tiempo de retraso en ms (por defecto 300ms).
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
