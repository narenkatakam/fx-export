import type { EffectDef, ParamDef, Preset } from './registry'

type Value = number | [number, number, number]
type Values = Record<string, Value>

interface PanelCallbacks {
  onEffectChange: (effectId: string) => void
  onParamChange: (key: string, value: Value) => void
  onExport: () => void
}

interface PanelController {
  element: HTMLElement
  switchEffect: (effect: EffectDef) => void
}

// --- Color utilities ---

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

function formatValue(v: number, step: number): string {
  if (step >= 1) return String(Math.round(v))
  if (step >= 0.1) return v.toFixed(1)
  return v.toFixed(2)
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

// --- Panel ---

export function createPanel(
  effects: EffectDef[],
  initialEffect: EffectDef,
  values: Values,
  callbacks: PanelCallbacks,
): PanelController {
  const panel = document.createElement('div')
  panel.className = 'panel'

  let activeEffect = initialEffect
  const inputs = new Map<string, HTMLInputElement>()
  const valueLabels = new Map<string, HTMLSpanElement>()

  // --- Header ---
  const header = document.createElement('div')
  header.className = 'panel-header'

  const title = document.createElement('span')
  title.className = 'panel-title'
  title.textContent = 'FX EXPORT'
  header.appendChild(title)

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'panel-toggle'
  toggleBtn.title = 'Toggle panel (H)'
  toggleBtn.textContent = '\u2014'
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    toggleBtn.textContent = panel.classList.contains('collapsed') ? '+' : '\u2014'
  })
  header.appendChild(toggleBtn)
  panel.appendChild(header)

  // --- Body ---
  const body = document.createElement('div')
  body.className = 'panel-body'

  // Effect selector
  const effectSection = createSection('Effect')
  const effectSelect = document.createElement('select')
  effectSelect.className = 'preset-select'
  for (const e of effects) {
    const opt = document.createElement('option')
    opt.value = e.id
    opt.textContent = e.name
    if (e.id === initialEffect.id) opt.selected = true
    effectSelect.appendChild(opt)
  }
  effectSelect.addEventListener('change', () => callbacks.onEffectChange(effectSelect.value))
  effectSection.appendChild(effectSelect)
  body.appendChild(effectSection)

  // Preset selector
  const presetSection = document.createElement('div')
  presetSection.className = 'panel-section'
  const presetSelect = document.createElement('select')
  presetSelect.className = 'preset-select'
  presetSelect.addEventListener('change', () => {
    const idx = parseInt(presetSelect.value)
    const preset = activeEffect.presets[idx]
    if (preset) applyPreset(preset)
  })
  body.appendChild(presetSection)

  // Params container (rebuilt on effect switch)
  const paramsContainer = document.createElement('div')
  body.appendChild(paramsContainer)

  // Actions
  const actions = document.createElement('div')
  actions.className = 'panel-actions'

  const exportBtn = document.createElement('button')
  exportBtn.className = 'btn-export'
  exportBtn.textContent = '\u2193 Export HTML'
  exportBtn.addEventListener('click', callbacks.onExport)
  actions.appendChild(exportBtn)

  const resetBtn = document.createElement('button')
  resetBtn.className = 'btn-reset'
  resetBtn.textContent = '\u21BB Reset'
  resetBtn.addEventListener('click', () => {
    const preset = activeEffect.presets.find(p => p.recommended) || activeEffect.presets[0]
    if (preset) {
      presetSelect.value = String(activeEffect.presets.indexOf(preset))
      applyPreset(preset)
    }
  })
  actions.appendChild(resetBtn)

  body.appendChild(actions)
  panel.appendChild(body)

  // --- Preset dropdown ---
  function buildPresetDropdown(effect: EffectDef) {
    presetSection.replaceChildren()

    const sectionTitle = document.createElement('div')
    sectionTitle.className = 'section-title'
    sectionTitle.textContent = 'Preset'
    presetSection.appendChild(sectionTitle)

    presetSelect.replaceChildren()
    const recommended = effect.presets.filter(p => p.recommended)
    const others = effect.presets.filter(p => !p.recommended)

    if (recommended.length > 0) {
      const group = document.createElement('optgroup')
      group.label = 'Recommended'
      for (const p of recommended) {
        const opt = document.createElement('option')
        opt.value = String(effect.presets.indexOf(p))
        opt.textContent = p.name
        group.appendChild(opt)
      }
      presetSelect.appendChild(group)
    }

    if (others.length > 0) {
      const group = document.createElement('optgroup')
      group.label = 'All Presets'
      for (const p of others) {
        const opt = document.createElement('option')
        opt.value = String(effect.presets.indexOf(p))
        opt.textContent = p.name
        group.appendChild(opt)
      }
      presetSelect.appendChild(group)
    }

    presetSection.appendChild(presetSelect)
  }

  function applyPreset(preset: Preset) {
    for (const [key, val] of Object.entries(preset.values)) {
      values[key] = Array.isArray(val) ? ([...val] as [number, number, number]) : val
    }
    updateAllInputs()
    for (const key of Object.keys(preset.values)) {
      callbacks.onParamChange(key, values[key])
    }
  }

  // --- Param sections ---
  function buildParams(effect: EffectDef) {
    paramsContainer.replaceChildren()
    inputs.clear()
    valueLabels.clear()

    // Group params preserving order
    const groups = new Map<string, ParamDef[]>()
    for (const p of effect.params) {
      if (!groups.has(p.group)) groups.set(p.group, [])
      groups.get(p.group)!.push(p)
    }

    for (const [groupName, params] of groups) {
      const section = createSection(groupName)

      for (const p of params) {
        if (p.type === 'color') {
          const val = (values[p.key] ?? p.default) as [number, number, number]
          const row = document.createElement('div')
          row.className = 'color-row'

          const lbl = document.createElement('label')
          lbl.textContent = p.label

          const input = document.createElement('input')
          input.type = 'color'
          input.value = rgbToHex(val)
          inputs.set(p.key, input)

          const hex = document.createElement('span')
          hex.className = 'hex-value'
          hex.textContent = rgbToHex(val)

          input.addEventListener('input', () => {
            const rgb = hexToRgb(input.value)
            hex.textContent = input.value
            values[p.key] = rgb
            callbacks.onParamChange(p.key, rgb)
          })

          row.appendChild(lbl)
          row.appendChild(input)
          row.appendChild(hex)
          section.appendChild(row)
        } else {
          const val = (values[p.key] ?? p.default) as number
          const row = document.createElement('div')
          row.className = 'slider-row'

          const label = document.createElement('label')
          label.textContent = p.label

          const valueSpan = document.createElement('span')
          valueSpan.className = 'slider-value'
          valueSpan.textContent = formatValue(val, p.step!)
          valueLabels.set(p.key, valueSpan)

          const input = document.createElement('input')
          input.type = 'range'
          input.min = String(p.min)
          input.max = String(p.max)
          input.step = String(p.step)
          input.value = String(val)
          inputs.set(p.key, input)

          input.addEventListener('input', () => {
            const v = parseFloat(input.value)
            valueSpan.textContent = formatValue(v, p.step!)
            values[p.key] = v
            callbacks.onParamChange(p.key, v)
          })

          row.appendChild(label)
          row.appendChild(valueSpan)
          row.appendChild(input)
          section.appendChild(row)
        }
      }

      paramsContainer.appendChild(section)
    }
  }

  function updateAllInputs() {
    for (const p of activeEffect.params) {
      const input = inputs.get(p.key)
      if (!input) continue
      const val = values[p.key] ?? p.default

      if (p.type === 'color') {
        const rgb = val as [number, number, number]
        input.value = rgbToHex(rgb)
        const hexLabel = input.parentElement?.querySelector('.hex-value') as HTMLSpanElement | null
        if (hexLabel) hexLabel.textContent = rgbToHex(rgb)
      } else {
        input.value = String(val)
        const label = valueLabels.get(p.key)
        if (label) label.textContent = formatValue(val as number, p.step!)
      }
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

  // Initial build
  buildPresetDropdown(initialEffect)
  buildParams(initialEffect)

  return {
    element: panel,
    switchEffect(effect: EffectDef) {
      activeEffect = effect
      effectSelect.value = effect.id
      buildPresetDropdown(effect)
      buildParams(effect)
    },
  }
}

// --- Export Modal ---

export function showExportModal(
  onDownload: (w: number, h: number, animated: boolean) => void,
  onCopy: (w: number, h: number, animated: boolean) => void,
) {
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

  const actionsDiv = document.createElement('div')
  actionsDiv.className = 'export-actions'

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

  actionsDiv.appendChild(downloadBtn)
  actionsDiv.appendChild(copyBtn)
  modal.appendChild(actionsDiv)

  overlay.appendChild(modal)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove()
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)

  document.body.appendChild(overlay)
}
