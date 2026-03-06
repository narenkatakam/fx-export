import type { EffectDef } from '../registry'
import vertShader from '../shaders/fluid.vert'
import fragShader from '../shaders/gradient.frag'

export const gradientEffect: EffectDef = {
  id: 'gradient',
  name: 'Gradient Mesh',
  description: 'Smooth morphing color blobs',
  vertShader,
  fragShader,
  needsBloom: false,
  params: [
    { key: 'u_color1', label: 'Color 1', type: 'color', group: 'Colors', default: [0.95, 0.3, 0.5] },
    { key: 'u_color2', label: 'Color 2', type: 'color', group: 'Colors', default: [0.3, 0.4, 0.95] },
    { key: 'u_color3', label: 'Color 3', type: 'color', group: 'Colors', default: [0.2, 0.9, 0.7] },
    { key: 'u_color4', label: 'Color 4', type: 'color', group: 'Colors', default: [0.95, 0.7, 0.2] },
    { key: 'u_bgColor', label: 'Background', type: 'color', group: 'Colors', default: [0.02, 0.02, 0.04] },
    { key: 'u_speed', label: 'Speed', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.7 },
    { key: 'u_scale', label: 'Scale', type: 'slider', group: 'Shape', min: 0.5, max: 5, step: 0.1, default: 2.0 },
    { key: 'u_softness', label: 'Softness', type: 'slider', group: 'Shape', min: 0.2, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_distortion', label: 'Distortion', type: 'slider', group: 'Effects', min: 0, max: 3, step: 0.05, default: 0.5 },
    { key: 'u_parallax', label: 'Parallax', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.4 },
  ],
  presets: [
    {
      name: 'Sunset Drift', recommended: true,
      values: {
        u_color1: [0.95, 0.3, 0.5], u_color2: [0.95, 0.6, 0.2], u_color3: [0.8, 0.2, 0.6], u_color4: [1.0, 0.85, 0.3],
        u_bgColor: [0.05, 0.02, 0.08], u_speed: 0.6, u_scale: 2.0, u_softness: 0.8, u_distortion: 0.5, u_parallax: 0.4,
      },
    },
    {
      name: 'Northern Lights', recommended: true,
      values: {
        u_color1: [0.1, 0.9, 0.5], u_color2: [0.2, 0.4, 0.95], u_color3: [0.6, 0.2, 0.9], u_color4: [0.1, 0.7, 0.8],
        u_bgColor: [0.01, 0.01, 0.03], u_speed: 0.4, u_scale: 1.8, u_softness: 1.0, u_distortion: 0.7, u_parallax: 0.5,
      },
    },
    {
      name: 'Cotton Candy',
      values: {
        u_color1: [1.0, 0.6, 0.7], u_color2: [0.6, 0.7, 1.0], u_color3: [0.9, 0.5, 0.9], u_color4: [0.7, 0.9, 1.0],
        u_bgColor: [0.95, 0.93, 0.96], u_speed: 0.3, u_scale: 2.5, u_softness: 1.2, u_distortion: 0.3, u_parallax: 0.3,
      },
    },
    {
      name: 'Cyber Neon',
      values: {
        u_color1: [0.0, 1.0, 0.8], u_color2: [1.0, 0.0, 0.6], u_color3: [0.4, 0.0, 1.0], u_color4: [1.0, 0.9, 0.0],
        u_bgColor: [0.01, 0.0, 0.02], u_speed: 0.8, u_scale: 1.5, u_softness: 0.6, u_distortion: 1.0, u_parallax: 0.5,
      },
    },
    {
      name: 'Earth Tones', recommended: true,
      values: {
        u_color1: [0.7, 0.45, 0.2], u_color2: [0.4, 0.55, 0.3], u_color3: [0.85, 0.65, 0.35], u_color4: [0.3, 0.35, 0.25],
        u_bgColor: [0.06, 0.05, 0.04], u_speed: 0.3, u_scale: 2.2, u_softness: 1.0, u_distortion: 0.4, u_parallax: 0.3,
      },
    },
    {
      name: 'Monochrome',
      values: {
        u_color1: [0.9, 0.9, 0.9], u_color2: [0.5, 0.5, 0.5], u_color3: [0.7, 0.7, 0.7], u_color4: [0.3, 0.3, 0.3],
        u_bgColor: [0.05, 0.05, 0.05], u_speed: 0.5, u_scale: 2.0, u_softness: 0.9, u_distortion: 0.6, u_parallax: 0.4,
      },
    },
  ],
}
