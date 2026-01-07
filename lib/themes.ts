export const THEMES = [
  { name: 'neutral', label: 'Neutral' },
  { name: 'amber', label: 'Amber' },
  { name: 'blue', label: 'Blue' },
  { name: 'green', label: 'Green' },
  { name: 'cyan', label: 'Cyan' },
  { name: 'emerald', label: 'Emerald' },
  { name: 'fuchsia', label: 'Fuchsia' },
  { name: 'indigo', label: 'Indigo' },
  { name: 'lime', label: 'Lime' },
  { name: 'orange', label: 'Orange' },
  { name: 'pink', label: 'Pink' },
] as const

export type Theme = (typeof THEMES)[number]['name']

