// tailwindcss v3 doesn't ship types for this internal helper used by the
// Aceternity bg-grid / bg-dot plugins in tailwind.config.ts.
declare module "tailwindcss/lib/util/flattenColorPalette" {
  const flattenColorPalette: (colors: unknown) => Record<string, string>;
  export default flattenColorPalette;
}
