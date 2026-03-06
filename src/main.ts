import { Renderer } from './renderer'
import { registerEffect, getEffect, getAllEffects, getDefaultValues } from './registry'
import { createPanel, showExportModal, getBrightness } from './controls'
import { generateExportHTML, downloadHTML, copyToClipboard } from './export'

// Register all effects
import { fluidEffect } from './effects/fluid'
import { gradientEffect } from './effects/gradient'
import { wavesEffect } from './effects/waves'
import { voronoiEffect } from './effects/voronoi'

registerEffect(fluidEffect)
registerEffect(gradientEffect)
registerEffect(wavesEffect)
registerEffect(voronoiEffect)

// State
const effects = getAllEffects()
let currentEffect = effects.find(e => e.id === 'gradient') || effects[0]
const values: Record<string, number | [number, number, number]> = {}

function loadPresetValues(effect: typeof currentEffect) {
  const preset = effect.presets.find(p => p.recommended) || effect.presets[0]
  const source = preset ? preset.values : getDefaultValues(effect)
  for (const key of Object.keys(values)) delete values[key]
  for (const [key, val] of Object.entries(source)) {
    values[key] = Array.isArray(val) ? ([...val] as [number, number, number]) : val
  }
}

loadPresetValues(currentEffect)

// Canvas & renderer
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const renderer = new Renderer(canvas)
renderer.loadEffect(currentEffect)
const startTime = performance.now()

// Mouse tracking
const mouse = { x: 0.5, y: 0.5 }
const smoothMouse = { x: 0.5, y: 0.5 }

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / window.innerWidth
  mouse.y = 1.0 - e.clientY / window.innerHeight
})

// Background color sync
function updateBgColor() {
  const bg = values.u_bgColor as [number, number, number] | undefined
  if (!bg) return
  document.body.style.background = `rgb(${Math.round(bg[0] * 255)}, ${Math.round(bg[1] * 255)}, ${Math.round(bg[2] * 255)})`
  if (getBrightness(bg) > 0.5) {
    document.body.classList.add('light-bg')
  } else {
    document.body.classList.remove('light-bg')
  }
}

updateBgColor()

// Panel
const panelCtrl = createPanel(effects, currentEffect, values, {
  onEffectChange(effectId) {
    const effect = getEffect(effectId)
    if (!effect) return
    currentEffect = effect
    renderer.loadEffect(effect)
    loadPresetValues(effect)
    panelCtrl.switchEffect(effect)
    updateBgColor()
  },
  onParamChange(key) {
    if (key === 'u_bgColor') updateBgColor()
  },
  onExport() {
    showExportModal(
      (w, h, animated) => {
        const html = generateExportHTML(currentEffect, values, w, h, animated)
        downloadHTML(html, `${currentEffect.id}-effect.html`)
      },
      (w, h, animated) => {
        const html = generateExportHTML(currentEffect, values, w, h, animated)
        copyToClipboard(html)
      },
    )
  },
})

document.body.appendChild(panelCtrl.element)

// Render loop
function render() {
  smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05
  smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05

  const time = (performance.now() - startTime) * 0.001
  const useBloom = currentEffect.needsBloom === true
  const bloomIntensity = useBloom ? ((values.bloom as number) ?? 0.3) : 0

  renderer.render(values, currentEffect.params, time, smoothMouse, bloomIntensity, useBloom)

  requestAnimationFrame(render)
}

render()
