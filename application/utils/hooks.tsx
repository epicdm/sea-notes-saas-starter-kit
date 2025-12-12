import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounced value hook
 * Returns a debounced version of the value that only updates after the specified delay
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

/**
 * Debounced callback hook
 * Returns a memoized callback that will only execute after the specified delay
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Session timeout hook
 * Automatically logs out user after specified inactivity period
 * 
 * @param onTimeout - Callback to execute on timeout
 * @param timeout - Timeout in milliseconds (default: 30 minutes)
 */
export function useSessionTimeout(
  onTimeout: () => void,
  timeout: number = 30 * 60 * 1000 // 30 minutes
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, timeout);
  }, [onTimeout, timeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    // Set initial timeout
    resetTimeout();

    // Add event listeners for user activity
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimeout]);
}

/**
 * Online status hook
 * Tracks whether the user is online or offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Local storage hook with JSON serialization
 * 
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Previous value hook
 * Returns the previous value of a variable
 * 
 * @param value - The value to track
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Click outside hook
 * Detects clicks outside of a specified element
 * 
 * @param ref - Ref to the element
 * @param handler - Callback when click occurs outside
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Media query hook
 * Tracks whether a media query matches
 * 
 * @param query - Media query string
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Intersection observer hook
 * Detects when an element enters or leaves the viewport
 * 
 * @param options - IntersectionObserver options
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return entry;
}
