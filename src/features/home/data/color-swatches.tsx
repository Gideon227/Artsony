export type ColorSwatch = {
  id: string
  label: string
  hex: string
}

// Static reference palette — intentionally not fetched from an API per spec.
export const COLOR_SWATCHES: ColorSwatch[] = [
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'white', label: 'White', hex: '#FFFFFF' },
  { id: 'gray',  label: 'Gray',  hex: '#9E9E9E' },
  { id: 'light-gray',  label: 'Light Gray',  hex: '#C7C7C7' },

  { id: 'ivory', label: 'Ivory', hex: '#F5F0DC' },
  { id: 'brown', label: 'Brown', hex: '#7B4B1F' },
  { id: 'pale-yellow', label: 'Pale Yellow', hex: '#FFFDE0' },
  { id: 'red', label: 'Red', hex: '#E5493D' },

  { id: 'orange', label: 'Orange', hex: '#F2811D' },
  { id: 'yellow', label: 'Yellow', hex: '#FBD84C' },
  { id: 'gold', label: 'Gold', hex: '#C9A227' },
  { id: 'green', label: 'Green', hex: '#4C9A2A' },

  { id: 'olive', label: 'Olive', hex: '#6C7A1F' },
  { id: 'teal', label: 'Teal', hex: '#00796B' },
  { id: 'cyan', label: 'Cyan', hex: '#1AC0D6' },
  { id: 'blue', label: 'Blue', hex: '#1E88E5' },

  { id: 'navy', label: 'Navy', hex: '#1A237E' },
  { id: 'purple', label: 'Purple', hex: '#7B1FA2' },
  { id: 'pink', label: 'Pink',  hex: '#EC5C8D' },
  { id: 'magenta', label: 'Magenta', hex: '#C2185B' },
]

const HEX_RE = /^#?[0-9a-fA-F]{6}$/

// Very small helper: given a partial hex string, find the closest palette
// swatch by straight-line RGB distance. Used by the "search by hex" input
// so typing a code still highlights something sensible from the static set.
export function findClosestSwatch(hexInput: string): ColorSwatch | null {
  const clean = hexInput.trim().replace(/^#/, '')
  if (!HEX_RE.test(`#${clean}`)) return null

  const target = {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }

  let closest: ColorSwatch | null = null
  let closestDist = Infinity

  for (const swatch of COLOR_SWATCHES) {
    const hex = swatch.hex.replace('#', '')
    const c = {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
    const dist = (c.r - target.r) ** 2 + (c.g - target.g) ** 2 + (c.b - target.b) ** 2
    if (dist < closestDist) {
      closestDist = dist
      closest = swatch
    }
  }

  return closest
}