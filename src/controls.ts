import type { EffectConfig } from './config'
import { rgbToHex, hexToRgb } from './config'
import { presets } from './presets'

type OnChange = <K extends keyof EffectConfig>(key: K, value: EffectConfig[K]) => void

interface SliderDef {
  key: keyof EffectConfig
  label: string
  min: number
  max: number
  step: number
}

interface ColorDef {
  key: 'colorA' | 'colorB' | 'colorC' | 'bgColor'
  label: string
}

const materialSliders: SliderDef[] = [
  { key: 'metallic', label: 'Metallic', min: 0, max: 1, step: 0.01 },
  { key: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.01 },
  { key: 'glossiness', label: 'Glossiness', min: 5, max: 100, step: 1 },
]

const motionSliders: SliderDef[] = [
  { key: 'speed', label: 'Speed', min: 0, max: 2, step: 0.05 },
  { key: 'complexity', label: 'Complexity', min: 0.5, max: 4, step: 0.1 },
  { key: 'warpIntensity', label: 'Warp', min: 0, max: 3, step: 0.05 },
]

const shapeSliders: SliderDef[] = [
  { key: 'zoom', label: 'Zoom', min: 0.5, max: 5, step: 0.1 },
  { key: 'elevation', label: 'Elevation', min: 0, max: 3, step: 0.05 },
]

const effectSliders: SliderDef[] = [
  { key: 'bloom', label: 'Bloom', min: 0, max: 1, step: 0.01 },
  { key: 'parallax', label: 'Parallax', min: 0, max: 1, step: 0.01 },
  { key: 'fresnelStrength', label: 'Fresnel', min: 0, max: 1, step: 0.01 },
  { key: 'envIntensity', label: 'Env Light', min: 0, max: 1.5, step: 0.01 },
]

const colorDefs: ColorDef[] = [
  { key: 'colorA', label: 'Primary' },
  { key: 'colorB', label: 'Secondary' },
  { key: 'colorC', label: 'Depth' },
  { key: 'bgColor', label: 'Background' },
]

export function createPanel(
  config: EffectConfig,
  onChange: OnChange,
  onExport: () => void,
): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'panel'

  const inputs: Map<string, HTMLInputElement> = new Map()
  const valueLabels: Map<string, HTMLSpanElement> = new Map()

  // Header
  const header = document.createElement('div')
  header.className = 'panel-header'

  const title = document.createElement('span')
  title.className = 'panel-title'
  title.textContent = 'FLUID EFFECTS'
  header.appendChild(title)

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'panel-toggle'
  toggleBtn.title = 'Toggle panel (H)'
  toggleBtn.textContent = '\u2014'
  header.appendChild(toggleBtn)

  panel.appendChild(header)

  const body = document.createElement('div')
  body.className = 'panel-body'

  // Toggle collapse
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    toggleBtn.textContent = panel.classList.contains('collapsed') ? '+' : '\u2014'
  })

  // Preset selector
  const presetSection = createSection('Preset')
  const select = document.createElement('select')
  select.className = 'preset-select'
  presets.forEach((p, i) => {
    const opt = document.createElement('option')
    opt.value = String(i)
    opt.textContent = p.name
    select.appendChild(opt)
  })
  select.addEventListener('change', () => {
    const preset = presets[parseInt(select.value)]
    Object.assign(config, structuredClone(preset.config))
    updateAllInputs()
    for (const key of Object.keys(preset.config) as (keyof EffectConfig)[]) {
      onChange(key, config[key] as any)
    }
  })
  presetSection.appendChild(select)
  body.appendChild(presetSection)

  // Colors
  const colorSection = createSection('Colors')
  for (const def of colorDefs) {
    const row = createColorPicker(def.label, config[def.key], (val) => {
      onChange(def.key, val)
    })
    colorSection.appendChild(row)
    inputs.set(def.key, row.querySelector('input[type="color"]')!)
  }
  body.appendChild(colorSection)

  // Material
  body.appendChild(createSliderSection('Material', materialSliders, config, onChange, inputs, valueLabels))

  // Motion
  body.appendChild(createSliderSection('Motion', motionSliders, config, onChange, inputs, valueLabels))

  // Shape
  body.appendChild(createSliderSection('Shape', shapeSliders, config, onChange, inputs, valueLabels))

  // Effects
  body.appendChild(createSliderSection('Effects', effectSliders, config, onChange, inputs, valueLabels))

  // Actions
  const actions = createSection('')
  actions.className = 'panel-actions'

  const exportBtn = document.createElement('button')
  exportBtn.className = 'btn-export'
  exportBtn.textContent = '\u2193 Export HTML'
  exportBtn.addEventListener('click', onExport)
  actions.appendChild(exportBtn)

  const resetBtn = document.createElement('button')
  resetBtn.className = 'btn-reset'
  resetBtn.textContent = '\u21BB Reset'
  resetBtn.addEventListener('click', () => {
    select.value = '0'
    const preset = presets[0]
    Object.assign(config, structuredClone(preset.config))
    updateAllInputs()
    for (const key of Object.keys(preset.config) as (keyof EffectConfig)[]) {
      onChange(key, config[key] as any)
    }
  })
  actions.appendChild(resetBtn)

  body.appendChild(actions)
  panel.appendChild(body)

  function updateAllInputs() {
    for (const def of colorDefs) {
      const input = inputs.get(def.key)
      if (input) input.value = rgbToHex(config[def.key])
      const hexLabel = input?.parentElement?.querySelector('.hex-value') as HTMLSpanElement | null
      if (hexLabel) hexLabel.textContent = rgbToHex(config[def.key])
    }
    const allSliders = [...materialSliders, ...motionSliders, ...shapeSliders, ...effectSliders]
    for (const s of allSliders) {
      const input = inputs.get(s.key)
      if (input) input.value = String(config[s.key])
      const label = valueLabels.get(s.key)
      if (label) label.textContent = formatValue(config[s.key] as number, s.step)
    }
  }

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return
      panel.classList.toggle('collapsed')
      toggleBtn.textContent = panel.classList.contains('collapsed') ? '+' : '\u2014'
    }
  })

  return panel
}

function createSection(title: string): HTMLDivElement {
  const section = document.createElement('div')
  section.className = 'panel-section'
  if (title) {
    const h = document.createElement('div')
    h.className = 'section-title'
    h.textContent = title
    section.appendChild(h)
  }
  return section
}

function createSliderSection(
  title: string,
  defs: SliderDef[],
  config: EffectConfig,
  onChange: OnChange,
  inputs: Map<string, HTMLInputElement>,
  valueLabels: Map<string, HTMLSpanElement>,
): HTMLDivElement {
  const section = createSection(title)
  for (const def of defs) {
    const row = document.createElement('div')
    row.className = 'slider-row'

    const label = document.createElement('label')
    label.textContent = def.label

    const value = document.createElement('span')
    value.className = 'slider-value'
    value.textContent = formatValue(config[def.key] as number, def.step)
    valueLabels.set(def.key, value)

    const input = document.createElement('input')
    input.type = 'range'
    input.min = String(def.min)
    input.max = String(def.max)
    input.step = String(def.step)
    input.value = String(config[def.key])
    inputs.set(def.key, input)

    input.addEventListener('input', () => {
      const v = parseFloat(input.value)
      value.textContent = formatValue(v, def.step)
      onChange(def.key, v as any)
    })

    row.appendChild(label)
    row.appendChild(value)
    row.appendChild(input)
    section.appendChild(row)
  }
  return section
}

function createColorPicker(
  label: string,
  value: [number, number, number],
  onChange: (val: [number, number, number]) => void,
): HTMLDivElement {
  const row = document.createElement('div')
  row.className = 'color-row'

  const lbl = document.createElement('label')
  lbl.textContent = label

  const input = document.createElement('input')
  input.type = 'color'
  input.value = rgbToHex(value)

  const hex = document.createElement('span')
  hex.className = 'hex-value'
  hex.textContent = rgbToHex(value)

  input.addEventListener('input', () => {
    const rgb = hexToRgb(input.value)
    hex.textContent = input.value
    onChange(rgb)
  })

  row.appendChild(lbl)
  row.appendChild(input)
  row.appendChild(hex)
  return row
}

function formatValue(v: number, step: number): string {
  if (step >= 1) return String(Math.round(v))
  if (step >= 0.1) return v.toFixed(1)
  return v.toFixed(2)
}

// Export modal
export function showExportModal(onDownload: (w: number, h: number, animated: boolean) => void, onCopy: (w: number, h: number, animated: boolean) => void) {
  const overlay = document.createElement('div')
  overlay.className = 'export-modal-overlay'

  const modal = document.createElement('div')
  modal.className = 'export-modal'

  const heading = document.createElement('h3')
  heading.textContent = 'Export Standalone HTML'
  modal.appendChild(heading)

  const desc = document.createElement('p')
  desc.textContent = 'Your effect is ready. This file has zero dependencies \u2014 drop it into any website.'
  modal.appendChild(desc)

  // Canvas size
  const sizeField = document.createElement('div')
  sizeField.className = 'export-field'

  const sizeLabel = document.createElement('label')
  sizeLabel.textContent = 'Canvas size'
  sizeField.appendChild(sizeLabel)

  const widthInput = document.createElement('input')
  widthInput.type = 'number'
  widthInput.value = '1920'
  widthInput.min = '320'
  widthInput.max = '7680'
  sizeField.appendChild(widthInput)

  const times = document.createElement('span')
  times.textContent = '\u00D7'
  sizeField.appendChild(times)

  const heightInput = document.createElement('input')
  heightInput.type = 'number'
  heightInput.value = '1080'
  heightInput.min = '240'
  heightInput.max = '4320'
  sizeField.appendChild(heightInput)

  modal.appendChild(sizeField)

  // Animated checkbox
  const checkRow = document.createElement('div')
  checkRow.className = 'export-checkbox'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'export-animated'
  checkbox.checked = true

  const checkLabel = document.createElement('label')
  checkLabel.htmlFor = 'export-animated'
  checkLabel.textContent = 'Include animation'

  checkRow.appendChild(checkbox)
  checkRow.appendChild(checkLabel)
  modal.appendChild(checkRow)

  // Action buttons
  const actions = document.createElement('div')
  actions.className = 'export-actions'

  const downloadBtn = document.createElement('button')
  downloadBtn.className = 'btn-download'
  downloadBtn.textContent = 'Download'
  downloadBtn.addEventListener('click', () => {
    const w = parseInt(widthInput.value) || 1920
    const h = parseInt(heightInput.value) || 1080
    onDownload(w, h, checkbox.checked)
    overlay.remove()
  })

  const copyBtn = document.createElement('button')
  copyBtn.className = 'btn-copy'
  copyBtn.textContent = 'Copy to Clipboard'
  copyBtn.addEventListener('click', () => {
    const w = parseInt(widthInput.value) || 1920
    const h = parseInt(heightInput.value) || 1080
    onCopy(w, h, checkbox.checked)
    copyBtn.textContent = 'Copied!'
    setTimeout(() => {
      copyBtn.textContent = 'Copy to Clipboard'
      overlay.remove()
    }, 1500)
  })

  actions.appendChild(downloadBtn)
  actions.appendChild(copyBtn)
  modal.appendChild(actions)

  overlay.appendChild(modal)

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })

  // Close on Escape
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove()
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)

  document.body.appendChild(overlay)
}
