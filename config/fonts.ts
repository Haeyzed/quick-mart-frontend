/**
 * List of available font names (visit the url `/settings/appearance`).
 * This array is used to generate dynamic font classes (e.g., `font-outfit`, `font-inter`, etc.).
 *
 * 📝 How to Add a New Font (Tailwind v4+):
 * 1. Add the font name here.
 * 2. Import the font in app/layout.tsx
 * 3. Add the font variable to the HTML className
 * 4. Update the font configuration in your CSS/theme files.
 */
export const fonts = [
  'outfit',
  'inter',
  'noto-sans',
  'figtree',
  'roboto',
  'raleway',
  'dm-sans',
  'public-sans',
  'jetbrains-mono',
] as const

