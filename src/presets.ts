import type { EffectConfig } from './config'

export interface Preset {
  name: string
  config: EffectConfig
}

export const presets: Preset[] = [
  // --- Fluid ---
  {
    name: 'Molten Gold',
    config: {
      colorA: [0.93, 0.79, 0.28],
      colorB: [0.55, 0.41, 0.08],
      colorC: [0.10, 0.06, 0.0],
      bgColor: [0.04, 0.04, 0.04],
      speed: 0.8, complexity: 1.5, zoom: 2.5, elevation: 1.5,
      glossiness: 40, metallic: 0.0, roughness: 0.3,
      warpIntensity: 1.5, bloom: 0.3, parallax: 0.5,
      fresnelStrength: 0.7, envIntensity: 0.6,
    },
  },
  {
    name: 'Deep Ocean',
    config: {
      colorA: [0.0, 0.9, 0.95],
      colorB: [0.0, 0.5, 0.6],
      colorC: [0.0, 0.05, 0.15],
      bgColor: [0.02, 0.02, 0.06],
      speed: 0.6, complexity: 1.8, zoom: 2.0, elevation: 1.8,
      glossiness: 50, metallic: 0.0, roughness: 0.3,
      warpIntensity: 1.8, bloom: 0.4, parallax: 0.5,
      fresnelStrength: 0.8, envIntensity: 0.5,
    },
  },
  {
    name: 'Neon Aurora',
    config: {
      colorA: [0.2, 0.95, 0.4],
      colorB: [0.85, 0.15, 0.7],
      colorC: [0.15, 0.0, 0.25],
      bgColor: [0.03, 0.01, 0.05],
      speed: 0.7, complexity: 2.0, zoom: 2.2, elevation: 1.6,
      glossiness: 45, metallic: 0.0, roughness: 0.25,
      warpIntensity: 1.6, bloom: 0.45, parallax: 0.5,
      fresnelStrength: 0.75, envIntensity: 0.55,
    },
  },
  {
    name: 'Obsidian Rose',
    config: {
      colorA: [0.9, 0.7, 0.75],
      colorB: [0.55, 0.1, 0.18],
      colorC: [0.08, 0.02, 0.04],
      bgColor: [0.04, 0.02, 0.03],
      speed: 0.5, complexity: 1.4, zoom: 2.8, elevation: 1.4,
      glossiness: 35, metallic: 0.0, roughness: 0.35,
      warpIntensity: 1.3, bloom: 0.35, parallax: 0.4,
      fresnelStrength: 0.65, envIntensity: 0.5,
    },
  },
  {
    name: 'Solar Flare',
    config: {
      colorA: [1.0, 0.9, 0.2],
      colorB: [0.9, 0.3, 0.05],
      colorC: [0.4, 0.1, 0.0],
      bgColor: [0.05, 0.02, 0.0],
      speed: 1.0, complexity: 1.6, zoom: 2.3, elevation: 1.7,
      glossiness: 55, metallic: 0.0, roughness: 0.2,
      warpIntensity: 1.7, bloom: 0.5, parallax: 0.6,
      fresnelStrength: 0.8, envIntensity: 0.6,
    },
  },
  // --- Metallic ---
  {
    name: 'Liquid Gold',
    config: {
      colorA: [0.95, 0.8, 0.3],
      colorB: [0.7, 0.55, 0.15],
      colorC: [0.3, 0.2, 0.05],
      bgColor: [0.03, 0.03, 0.03],
      speed: 0.6, complexity: 1.3, zoom: 2.5, elevation: 1.4,
      glossiness: 60, metallic: 1.0, roughness: 0.15,
      warpIntensity: 1.2, bloom: 0.35, parallax: 0.5,
      fresnelStrength: 0.9, envIntensity: 0.8,
    },
  },
  {
    name: 'Brushed Silver',
    config: {
      colorA: [0.85, 0.85, 0.88],
      colorB: [0.6, 0.62, 0.65],
      colorC: [0.3, 0.32, 0.35],
      bgColor: [0.06, 0.06, 0.07],
      speed: 0.4, complexity: 1.2, zoom: 2.8, elevation: 1.2,
      glossiness: 30, metallic: 1.0, roughness: 0.6,
      warpIntensity: 1.0, bloom: 0.2, parallax: 0.3,
      fresnelStrength: 0.7, envIntensity: 0.7,
    },
  },
  {
    name: 'Rose Gold',
    config: {
      colorA: [0.9, 0.65, 0.6],
      colorB: [0.75, 0.45, 0.35],
      colorC: [0.4, 0.2, 0.15],
      bgColor: [0.04, 0.03, 0.03],
      speed: 0.5, complexity: 1.4, zoom: 2.6, elevation: 1.3,
      glossiness: 45, metallic: 1.0, roughness: 0.3,
      warpIntensity: 1.2, bloom: 0.3, parallax: 0.4,
      fresnelStrength: 0.85, envIntensity: 0.75,
    },
  },
  {
    name: 'Black Chrome',
    config: {
      colorA: [0.35, 0.4, 0.55],
      colorB: [0.1, 0.1, 0.15],
      colorC: [0.02, 0.02, 0.04],
      bgColor: [0.01, 0.01, 0.02],
      speed: 0.5, complexity: 1.3, zoom: 2.4, elevation: 1.5,
      glossiness: 70, metallic: 1.0, roughness: 0.1,
      warpIntensity: 1.1, bloom: 0.4, parallax: 0.5,
      fresnelStrength: 0.95, envIntensity: 0.85,
    },
  },
  {
    name: 'Mercury',
    config: {
      colorA: [0.9, 0.9, 0.92],
      colorB: [0.7, 0.72, 0.75],
      colorC: [0.4, 0.42, 0.45],
      bgColor: [0.05, 0.05, 0.06],
      speed: 0.7, complexity: 1.6, zoom: 2.2, elevation: 1.6,
      glossiness: 80, metallic: 1.0, roughness: 0.0,
      warpIntensity: 1.5, bloom: 0.45, parallax: 0.6,
      fresnelStrength: 1.0, envIntensity: 0.9,
    },
  },
]
