import { useState, useEffect } from 'react';

export function usePersistState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get the initial value from localStorage or use the provided initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Update localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
}