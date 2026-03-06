export interface ParamDef {
  key: string
  label: string
  type: 'slider' | 'color'
  group: string
  // Slider props
  min?: number
  max?: number
  step?: number
  // Default value
  default: number | [number, number, number]
}

export interface Preset {
  name: string
  recommended?: boolean
  values: Record<string, number | [number, number, number]>
}

export interface EffectDef {
  id: string
  name: string
  description: string
  vertShader: string
  fragShader: string
  params: ParamDef[]
  presets: Preset[]
  // Optional: extra shaders for multi-pass (bloom etc)
  needsBloom?: boolean
}

const effects: Map<string, EffectDef> = new Map()

export function registerEffect(def: EffectDef) {
  effects.set(def.id, def)
}

export function getEffect(id: string): EffectDef | undefined {
  return effects.get(id)
}

export function getAllEffects(): EffectDef[] {
  return Array.from(effects.values())
}

export function getDefaultValues(def: EffectDef): Record<string, number | [number, number, number]> {
  const values: Record<string, number | [number, number, number]> = {}
  for (const p of def.params) {
    values[p.key] = p.default
  }
  return values
}
