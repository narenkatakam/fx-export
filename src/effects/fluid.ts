import type { EffectDef } from '../registry'
import vertShader from '../shaders/fluid.vert'
import fragShader from '../shaders/fluid.frag'

export const fluidEffect: EffectDef = {
  id: 'fluid',
  name: 'Fluid Surface',
  description: 'Organic 3D fluid with metallic materials',
  vertShader,
  fragShader,
  needsBloom: true,
  params: [
    // Colors
    { key: 'u_colorA', label: 'Primary', type: 'color', group: 'Colors', default: [0.93, 0.79, 0.28] },
    { key: 'u_colorB', label: 'Secondary', type: 'color', group: 'Colors', default: [0.55, 0.41, 0.08] },
    { key: 'u_colorC', label: 'Depth', type: 'color', group: 'Colors', default: [0.10, 0.06, 0.0] },
    { key: 'u_bgColor', label: 'Background', type: 'color', group: 'Colors', default: [0.04, 0.04, 0.04] },
    // Material
    { key: 'u_metallic', label: 'Metallic', type: 'slider', group: 'Material', min: 0, max: 1, step: 0.01, default: 0.0 },
    { key: 'u_roughness', label: 'Roughness', type: 'slider', group: 'Material', min: 0, max: 1, step: 0.01, default: 0.3 },
    { key: 'u_glossiness', label: 'Glossiness', type: 'slider', group: 'Material', min: 5, max: 100, step: 1, default: 40 },
    // Motion
    { key: 'u_speed', label: 'Speed', type: 'slider', group: 'Motion', min: 0, max: 2, step: 0.05, default: 0.8 },
    { key: 'u_complexity', label: 'Complexity', type: 'slider', group: 'Motion', min: 0.5, max: 4, step: 0.1, default: 1.5 },
    { key: 'u_warpIntensity', label: 'Warp', type: 'slider', group: 'Motion', min: 0, max: 3, step: 0.05, default: 1.5 },
    // Shape
    { key: 'u_zoom', label: 'Zoom', type: 'slider', group: 'Shape', min: 0.5, max: 5, step: 0.1, default: 2.5 },
    { key: 'u_elevation', label: 'Elevation', type: 'slider', group: 'Shape', min: 0, max: 3, step: 0.05, default: 1.5 },
    // Effects
    { key: 'u_fresnelStrength', label: 'Fresnel', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.7 },
    { key: 'u_envIntensity', label: 'Env Light', type: 'slider', group: 'Effects', min: 0, max: 1.5, step: 0.01, default: 0.6 },
    { key: 'u_parallax', label: 'Parallax', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.5 },
    { key: 'bloom', label: 'Bloom', type: 'slider', group: 'Effects', min: 0, max: 1, step: 0.01, default: 0.3 },
  ],
  presets: [
    {
      name: 'Molten Gold', recommended: true,
      values: {
        u_colorA: [0.93, 0.79, 0.28], u_colorB: [0.55, 0.41, 0.08], u_colorC: [0.10, 0.06, 0.0], u_bgColor: [0.04, 0.04, 0.04],
        u_speed: 0.8, u_complexity: 1.5, u_zoom: 2.5, u_elevation: 1.5, u_glossiness: 40, u_metallic: 0.0, u_roughness: 0.3,
        u_warpIntensity: 1.5, u_parallax: 0.5, u_fresnelStrength: 0.7, u_envIntensity: 0.6,
      },
    },
    {
      name: 'Deep Ocean', recommended: true,
      values: {
        u_colorA: [0.0, 0.9, 0.95], u_colorB: [0.0, 0.5, 0.6], u_colorC: [0.0, 0.05, 0.15], u_bgColor: [0.02, 0.02, 0.06],
        u_speed: 0.6, u_complexity: 1.8, u_zoom: 2.0, u_elevation: 1.8, u_glossiness: 50, u_metallic: 0.0, u_roughness: 0.3,
        u_warpIntensity: 1.8, u_parallax: 0.5, u_fresnelStrength: 0.8, u_envIntensity: 0.5,
      },
    },
    {
      name: 'Neon Aurora',
      values: {
        u_colorA: [0.2, 0.95, 0.4], u_colorB: [0.85, 0.15, 0.7], u_colorC: [0.15, 0.0, 0.25], u_bgColor: [0.03, 0.01, 0.05],
        u_speed: 0.7, u_complexity: 2.0, u_zoom: 2.2, u_elevation: 1.6, u_glossiness: 45, u_metallic: 0.0, u_roughness: 0.25,
        u_warpIntensity: 1.6, u_parallax: 0.5, u_fresnelStrength: 0.75, u_envIntensity: 0.55,
      },
    },
    {
      name: 'Obsidian Rose',
      values: {
        u_colorA: [0.9, 0.7, 0.75], u_colorB: [0.55, 0.1, 0.18], u_colorC: [0.08, 0.02, 0.04], u_bgColor: [0.04, 0.02, 0.03],
        u_speed: 0.5, u_complexity: 1.4, u_zoom: 2.8, u_elevation: 1.4, u_glossiness: 35, u_metallic: 0.0, u_roughness: 0.35,
        u_warpIntensity: 1.3, u_parallax: 0.4, u_fresnelStrength: 0.65, u_envIntensity: 0.5,
      },
    },
    {
      name: 'Solar Flare',
      values: {
        u_colorA: [1.0, 0.9, 0.2], u_colorB: [0.9, 0.3, 0.05], u_colorC: [0.4, 0.1, 0.0], u_bgColor: [0.05, 0.02, 0.0],
        u_speed: 1.0, u_complexity: 1.6, u_zoom: 2.3, u_elevation: 1.7, u_glossiness: 55, u_metallic: 0.0, u_roughness: 0.2,
        u_warpIntensity: 1.7, u_parallax: 0.6, u_fresnelStrength: 0.8, u_envIntensity: 0.6,
      },
    },
    {
      name: 'Liquid Gold', recommended: true,
      values: {
        u_colorA: [0.95, 0.8, 0.3], u_colorB: [0.7, 0.55, 0.15], u_colorC: [0.3, 0.2, 0.05], u_bgColor: [0.03, 0.03, 0.03],
        u_speed: 0.6, u_complexity: 1.3, u_zoom: 2.5, u_elevation: 1.4, u_glossiness: 60, u_metallic: 1.0, u_roughness: 0.15,
        u_warpIntensity: 1.2, u_parallax: 0.5, u_fresnelStrength: 0.9, u_envIntensity: 0.8,
      },
    },
    {
      name: 'Brushed Silver',
      values: {
        u_colorA: [0.85, 0.85, 0.88], u_colorB: [0.6, 0.62, 0.65], u_colorC: [0.3, 0.32, 0.35], u_bgColor: [0.06, 0.06, 0.07],
        u_speed: 0.4, u_complexity: 1.2, u_zoom: 2.8, u_elevation: 1.2, u_glossiness: 30, u_metallic: 1.0, u_roughness: 0.6,
        u_warpIntensity: 1.0, u_parallax: 0.3, u_fresnelStrength: 0.7, u_envIntensity: 0.7,
      },
    },
    {
      name: 'Black Chrome',
      values: {
        u_colorA: [0.35, 0.4, 0.55], u_colorB: [0.1, 0.1, 0.15], u_colorC: [0.02, 0.02, 0.04], u_bgColor: [0.01, 0.01, 0.02],
        u_speed: 0.5, u_complexity: 1.3, u_zoom: 2.4, u_elevation: 1.5, u_glossiness: 70, u_metallic: 1.0, u_roughness: 0.1,
        u_warpIntensity: 1.1, u_parallax: 0.5, u_fresnelStrength: 0.95, u_envIntensity: 0.85,
      },
    },
    {
      name: 'Mercury', recommended: true,
      values: {
        u_colorA: [0.9, 0.9, 0.92], u_colorB: [0.7, 0.72, 0.75], u_colorC: [0.4, 0.42, 0.45], u_bgColor: [0.05, 0.05, 0.06],
        u_speed: 0.7, u_complexity: 1.6, u_zoom: 2.2, u_elevation: 1.6, u_glossiness: 80, u_metallic: 1.0, u_roughness: 0.0,
        u_warpIntensity: 1.5, u_parallax: 0.6, u_fresnelStrength: 1.0, u_envIntensity: 0.9,
      },
    },
    {
      name: 'Rose Gold',
      values: {
        u_colorA: [0.9, 0.65, 0.6], u_colorB: [0.75, 0.45, 0.35], u_colorC: [0.4, 0.2, 0.15], u_bgColor: [0.04, 0.03, 0.03],
        u_speed: 0.5, u_complexity: 1.4, u_zoom: 2.6, u_elevation: 1.3, u_glossiness: 45, u_metallic: 1.0, u_roughness: 0.3,
        u_warpIntensity: 1.2, u_parallax: 0.4, u_fresnelStrength: 0.85, u_envIntensity: 0.75,
      },
    },
  ],
}
