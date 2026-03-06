export interface EffectConfig {
  colorA: [number, number, number]
  colorB: [number, number, number]
  colorC: [number, number, number]
  bgColor: [number, number, number]
  speed: number
  complexity: number
  zoom: number
  elevation: number
  glossiness: number
  metallic: number
  roughness: number
  warpIntensity: number
  bloom: number
  parallax: number
  fresnelStrength: number
  envIntensity: number
}

export const defaultConfig: EffectConfig = {
  colorA: [0.93, 0.79, 0.28],
  colorB: [0.55, 0.41, 0.08],
  colorC: [0.10, 0.06, 0.0],
  bgColor: [0.04, 0.04, 0.04],
  speed: 0.8,
  complexity: 1.5,
  zoom: 2.5,
  elevation: 1.5,
  glossiness: 40,
  metallic: 0.0,
  roughness: 0.3,
  warpIntensity: 1.5,
  bloom: 0.3,
  parallax: 0.5,
  fresnelStrength: 0.7,
  envIntensity: 0.6,
}

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

export function rgbToHex(rgb: [number, number, number]): string {
  const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0')
  const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0')
  const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

export function getBrightness(rgb: [number, number, number]): number {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
}
