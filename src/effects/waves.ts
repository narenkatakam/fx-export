import type { EffectDef } from '../registry'
import vertShader from '../shaders/fluid.vert'
import fragShader from '../shaders/waves.frag'

export const wavesEffect: EffectDef = {
  id: 'waves',
  name: 'Wave Ripples',
  description: 'Interference patterns with caustic light',
  vertShader,
  fragShader,
  needsBloom: false,
  params: [
    { key: 'u_colorA', label: 'Primary', type: 'color', group: 'Colors', default: [0.1, 0.3, 0.6] },
    { key: 'u_colorB', label: 'Secondary', type: 'color', group: 'Colors', default: [0.0, 0.6, 0.8] },
    { key: 'u_bgColor', label: 'Background', type: 'color', group: 'Colors', default: [0.02, 0.04, 0.08] },
    { key: 'u_speed', label: 'Speed', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_waveCount', label: 'Wave Sources', type: 'slider', group: 'Shape', min: 2, max: 12, step: 1, default: 6 },
    { key: 'u_frequency', label: 'Frequency', type: 'slider', group: 'Shape', min: 5, max: 40, step: 1, default: 15 },
    { key: 'u_amplitude', label: 'Amplitude', type: 'slider', group: 'Shape', min: 0.1, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_causticIntensity', label: 'Caustics', type: 'slider', group: 'Effects', min: 0, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_distortion', label: 'Distortion', type: 'slider', group: 'Effects', min: 0, max: 2, step: 0.05, default: 0.3 },
    { key: 'u_parallax', label: 'Parallax', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.4 },
  ],
  presets: [
    {
      name: 'Deep Pool', recommended: true,
      values: {
        u_colorA: [0.05, 0.2, 0.5], u_colorB: [0.0, 0.5, 0.7], u_bgColor: [0.01, 0.02, 0.05],
        u_speed: 0.7, u_waveCount: 6, u_frequency: 15, u_amplitude: 0.8, u_causticIntensity: 0.8,
        u_distortion: 0.3, u_parallax: 0.4,
      },
    },
    {
      name: 'Moonlit Water', recommended: true,
      values: {
        u_colorA: [0.1, 0.12, 0.2], u_colorB: [0.3, 0.35, 0.5], u_bgColor: [0.02, 0.02, 0.04],
        u_speed: 0.4, u_waveCount: 8, u_frequency: 20, u_amplitude: 0.5, u_causticIntensity: 1.2,
        u_distortion: 0.2, u_parallax: 0.3,
      },
    },
    {
      name: 'Lava Ripples',
      values: {
        u_colorA: [0.6, 0.1, 0.0], u_colorB: [1.0, 0.5, 0.1], u_bgColor: [0.05, 0.01, 0.0],
        u_speed: 0.5, u_waveCount: 5, u_frequency: 12, u_amplitude: 1.0, u_causticIntensity: 0.6,
        u_distortion: 0.5, u_parallax: 0.4,
      },
    },
    {
      name: 'Acid Rain',
      values: {
        u_colorA: [0.1, 0.4, 0.1], u_colorB: [0.3, 0.9, 0.2], u_bgColor: [0.01, 0.03, 0.01],
        u_speed: 1.0, u_waveCount: 10, u_frequency: 25, u_amplitude: 0.6, u_causticIntensity: 1.0,
        u_distortion: 0.8, u_parallax: 0.5,
      },
    },
    {
      name: 'Gentle Pond',
      values: {
        u_colorA: [0.2, 0.35, 0.3], u_colorB: [0.3, 0.5, 0.45], u_bgColor: [0.04, 0.06, 0.05],
        u_speed: 0.3, u_waveCount: 4, u_frequency: 10, u_amplitude: 0.4, u_causticIntensity: 0.5,
        u_distortion: 0.1, u_parallax: 0.3,
      },
    },
  ],
}
