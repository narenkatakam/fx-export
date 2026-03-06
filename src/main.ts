import { Renderer } from './renderer'
import { defaultConfig } from './config'
import { getBrightness } from './config'
import { createPanel, showExportModal } from './controls'
import { generateExportHTML, downloadHTML, copyToClipboard } from './export'

// State
const config = { ...defaultConfig }
const mouse = { x: 0.5, y: 0.5 }
const smoothMouse = { x: 0.5, y: 0.5 }

// Canvas & renderer
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const renderer = new Renderer(canvas)
const startTime = performance.now()

// Mouse tracking
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / window.innerWidth
  mouse.y = 1.0 - e.clientY / window.innerHeight
})

// Background color sync
function updateBgColor() {
  const [r, g, b] = config.bgColor
  document.body.style.background = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

  if (getBrightness(config.bgColor) > 0.5) {
    document.body.classList.add('light-bg')
  } else {
    document.body.classList.remove('light-bg')
  }
}
updateBgColor()

// Controls
const panel = createPanel(
  config,
  (key, _value) => {
    if (key === 'bgColor') updateBgColor()
  },
  () => {
    showExportModal(
      (w, h, animated) => {
        const html = generateExportHTML(config, w, h, animated)
        downloadHTML(html, 'fluid-effect.html')
      },
      (w, h, animated) => {
        const html = generateExportHTML(config, w, h, animated)
        copyToClipboard(html)
      },
    )
  },
)
document.body.appendChild(panel)

// Render loop
function render() {
  smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05
  smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05

  const time = (performance.now() - startTime) * 0.001
  renderer.render(config, time, smoothMouse)

  requestAnimationFrame(render)
}

render()
