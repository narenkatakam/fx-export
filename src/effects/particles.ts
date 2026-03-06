import type { EffectDef } from '../registry'
import vertShader from '../shaders/fluid.vert'
import fragShader from '../shaders/particles.frag'

export const particlesEffect: EffectDef = {
  id: 'particles',
  name: 'Particle Drift',
  description: 'Connected particles drifting through force fields',
  vertShader,
  fragShader,
  needsBloom: false,
  params: [
    { key: 'u_particleColor', label: 'Particles', type: 'color', group: 'Colors', default: [0.8, 0.85, 1.0] },
    { key: 'u_lineColor', label: 'Lines', type: 'color', group: 'Colors', default: [0.4, 0.45, 0.6] },
    { key: 'u_bgColor', label: 'Background', type: 'color', group: 'Colors', default: [0.03, 0.03, 0.05] },
    { key: 'u_speed', label: 'Speed', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.6 },
    { key: 'u_drift', label: 'Drift', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_density', label: 'Density', type: 'slider', group: 'Shape', min: 3, max: 15, step: 0.5, default: 8 },
    { key: 'u_particleSize', label: 'Particle Size', type: 'slider', group: 'Shape', min: 0.3, max: 3, step: 0.1, default: 1.0 },
    { key: 'u_connectDistance', label: 'Connect Range', type: 'slider', group: 'Shape', min: 1, max: 4, step: 0.1, default: 2.2 },
    { key: 'u_glow', label: 'Glow', type: 'slider', group: 'Effects', min: 0, max: 2, step: 0.05, default: 0.6 },
    { key: 'u_parallax', label: 'Parallax', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.3 },
  ],
  presets: [
    {
      name: 'Neural Network', recommended: true,
      values: {
        u_particleColor: [0.7, 0.8, 1.0], u_lineColor: [0.3, 0.4, 0.65], u_bgColor: [0.02, 0.02, 0.05],
        u_speed: 0.5, u_drift: 0.8, u_density: 8, u_particleSize: 1.0, u_connectDistance: 2.2,
        u_glow: 0.6, u_parallax: 0.3,
      },
    },
    {
      name: 'Fireflies', recommended: true,
      values: {
        u_particleColor: [1.0, 0.9, 0.4], u_lineColor: [0.4, 0.35, 0.15], u_bgColor: [0.02, 0.03, 0.01],
        u_speed: 0.3, u_drift: 1.2, u_density: 5, u_particleSize: 1.5, u_connectDistance: 1.5,
        u_glow: 1.2, u_parallax: 0.4,
      },
    },
    {
      name: 'Constellation',
      values: {
        u_particleColor: [1.0, 1.0, 1.0], u_lineColor: [0.25, 0.25, 0.35], u_bgColor: [0.01, 0.01, 0.02],
        u_speed: 0.2, u_drift: 0.4, u_density: 6, u_particleSize: 0.8, u_connectDistance: 2.5,
        u_glow: 0.4, u_parallax: 0.5,
      },
    },
    {
      name: 'Neon Grid',
      values: {
        u_particleColor: [0.0, 1.0, 0.8], u_lineColor: [0.0, 0.5, 0.4], u_bgColor: [0.0, 0.02, 0.02],
        u_speed: 0.7, u_drift: 0.6, u_density: 10, u_particleSize: 0.7, u_connectDistance: 2.0,
        u_glow: 0.8, u_parallax: 0.3,
      },
    },
    {
      name: 'Sparse Cosmos', recommended: true,
      values: {
        u_particleColor: [0.9, 0.7, 1.0], u_lineColor: [0.3, 0.2, 0.4], u_bgColor: [0.01, 0.0, 0.02],
        u_speed: 0.15, u_drift: 1.0, u_density: 4, u_particleSize: 1.2, u_connectDistance: 3.0,
        u_glow: 1.0, u_parallax: 0.6,
      },
    },
  ],
}
