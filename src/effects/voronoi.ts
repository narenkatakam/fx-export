import type { EffectDef } from '../registry'
import vertShader from '../shaders/fluid.vert'
import fragShader from '../shaders/voronoi.frag'

export const voronoiEffect: EffectDef = {
  id: 'voronoi',
  name: 'Voronoi Glass',
  description: 'Crystalline cell patterns with refraction',
  vertShader,
  fragShader,
  needsBloom: false,
  params: [
    { key: 'u_cellColor', label: 'Cell Color', type: 'color', group: 'Colors', default: [0.15, 0.18, 0.25] },
    { key: 'u_edgeColor', label: 'Edges', type: 'color', group: 'Colors', default: [0.6, 0.7, 0.9] },
    { key: 'u_glowColor', label: 'Glow', type: 'color', group: 'Colors', default: [0.3, 0.5, 1.0] },
    { key: 'u_bgColor', label: 'Background', type: 'color', group: 'Colors', default: [0.03, 0.03, 0.06] },
    { key: 'u_speed', label: 'Speed', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.5 },
    { key: 'u_drift', label: 'Drift', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.6 },
    { key: 'u_cellScale', label: 'Cell Scale', type: 'slider', group: 'Shape', min: 2, max: 15, step: 0.5, default: 6 },
    { key: 'u_edgeWidth', label: 'Edge Width', type: 'slider', group: 'Shape', min: 0.01, max: 0.3, step: 0.005, default: 0.08 },
    { key: 'u_refraction', label: 'Refraction', type: 'slider', group: 'Effects', min: 0, max: 2, step: 0.05, default: 0.5 },
    { key: 'u_edgeGlow', label: 'Edge Glow', type: 'slider', group: 'Effects', min: 0, max: 2, step: 0.05, default: 0.6 },
    { key: 'u_parallax', label: 'Parallax', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.3 },
  ],
  presets: [
    {
      name: 'Ice Crystal', recommended: true,
      values: {
        u_cellColor: [0.12, 0.15, 0.22], u_edgeColor: [0.5, 0.7, 0.95], u_glowColor: [0.3, 0.5, 1.0], u_bgColor: [0.02, 0.03, 0.06],
        u_speed: 0.4, u_drift: 0.5, u_cellScale: 6, u_edgeWidth: 0.08, u_refraction: 0.5, u_edgeGlow: 0.7, u_parallax: 0.3,
      },
    },
    {
      name: 'Lava Cracks', recommended: true,
      values: {
        u_cellColor: [0.15, 0.02, 0.0], u_edgeColor: [1.0, 0.4, 0.1], u_glowColor: [1.0, 0.6, 0.2], u_bgColor: [0.03, 0.01, 0.0],
        u_speed: 0.3, u_drift: 0.3, u_cellScale: 5, u_edgeWidth: 0.05, u_refraction: 0.3, u_edgeGlow: 1.2, u_parallax: 0.3,
      },
    },
    {
      name: 'Honeycomb',
      values: {
        u_cellColor: [0.35, 0.25, 0.1], u_edgeColor: [0.8, 0.65, 0.3], u_glowColor: [0.6, 0.5, 0.2], u_bgColor: [0.1, 0.07, 0.03],
        u_speed: 0.2, u_drift: 0.2, u_cellScale: 8, u_edgeWidth: 0.04, u_refraction: 0.2, u_edgeGlow: 0.4, u_parallax: 0.2,
      },
    },
    {
      name: 'Bio Cells',
      values: {
        u_cellColor: [0.05, 0.15, 0.08], u_edgeColor: [0.2, 0.8, 0.4], u_glowColor: [0.1, 0.6, 0.3], u_bgColor: [0.01, 0.04, 0.02],
        u_speed: 0.6, u_drift: 0.8, u_cellScale: 4, u_edgeWidth: 0.12, u_refraction: 0.7, u_edgeGlow: 0.8, u_parallax: 0.4,
      },
    },
    {
      name: 'Stained Glass', recommended: true,
      values: {
        u_cellColor: [0.2, 0.1, 0.15], u_edgeColor: [0.15, 0.12, 0.1], u_glowColor: [0.8, 0.6, 0.3], u_bgColor: [0.04, 0.02, 0.03],
        u_speed: 0.15, u_drift: 0.15, u_cellScale: 7, u_edgeWidth: 0.06, u_refraction: 0.8, u_edgeGlow: 0.3, u_parallax: 0.2,
      },
    },
  ],
}
