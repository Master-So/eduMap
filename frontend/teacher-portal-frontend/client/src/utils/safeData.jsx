export const hasItems = (value) => Array.isArray(value) && value.length > 0;
export const displayValue = (value, fallback = '—') => value === undefined || value === null || value === '' ? fallback : String(value);
export const initials = (value) => displayValue(value, 'T').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'T';
