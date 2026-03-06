import type { EffectDef } from './registry'

type Values = Record<string, number | [number, number, number]>

function escapeForTemplate(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

function rgbCSS(c: [number, number, number]): string {
  return `${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}`
}

function getBrightness(rgb: [number, number, number]): number {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
}

function fmt(v: number): string {
  return v.toFixed(4)
}

export function generateExportHTML(
  effect: EffectDef,
  values: Values,
  width: number,
  height: number,
  animated: boolean,
): string {
  // Background color for page
  const bgParam = effect.params.find(p => p.key === 'u_bgColor')
  const bgColor = (bgParam ? values[bgParam.key] ?? bgParam.default : [0.04, 0.04, 0.04]) as [number, number, number]
  const attrColor = getBrightness(bgColor) > 0.5 ? '#1a1a1a' : '#e0e0e0'

  // Only include actual shader uniforms (u_ prefix)
  const shaderParams = effect.params.filter(p => p.key.startsWith('u_'))
  const uniformNames = ['u_resolution', 'u_time', 'u_mouse', ...shaderParams.map(p => p.key)]
  const uniformNamesJS = uniformNames.map(n => `'${n}'`).join(',')

  // Generate uniform-setting code
  const uniformLines: string[] = []
  for (const p of shaderParams) {
    const val = values[p.key] ?? p.default
    if (p.type === 'color') {
      const c = val as [number, number, number]
      uniformLines.push(`gl.uniform3fv(u['${p.key}'],[${c.map(fmt).join(',')}]);`)
    } else {
      uniformLines.push(`gl.uniform1f(u['${p.key}'],${fmt(val as number)});`)
    }
  }
  const uniformSetCode = uniformLines.join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${effect.name} \u2014 FX Export</title>
<style>
*{margin:0;padding:0}
body{background:rgb(${rgbCSS(bgColor)});overflow:hidden}
canvas{width:100vw;height:100vh;display:block}
.a{position:fixed;bottom:8px;right:12px;font:10px/1 -apple-system,system-ui,sans-serif;opacity:.3;color:${attrColor};pointer-events:none;user-select:none}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div class="a">Naren Katakam</div>
<script>
(function(){
const vs=\`${escapeForTemplate(effect.vertShader)}\`;
const fs=\`${escapeForTemplate(effect.fragShader)}\`;
const c=document.getElementById('c');
const dpr=Math.min(devicePixelRatio,2);
c.width=${width}*dpr;c.height=${height}*dpr;
const gl=c.getContext('webgl',{antialias:false,alpha:false});
gl.getExtension('OES_standard_derivatives');
function cs(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
const p=gl.createProgram();
gl.attachShader(p,cs(gl.VERTEX_SHADER,vs));
gl.attachShader(p,cs(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(p);gl.useProgram(p);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
const a=gl.getAttribLocation(p,'a_position');
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
const u={};
[${uniformNamesJS}].forEach(n=>u[n]=gl.getUniformLocation(p,n));
gl.viewport(0,0,c.width,c.height);
const t0=performance.now();
let mx=0.5,my=0.5;
document.addEventListener('mousemove',e=>{mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight;});
function r(){
gl.uniform2f(u['u_resolution'],c.width,c.height);
gl.uniform1f(u['u_time'],(performance.now()-t0)*0.001);
gl.uniform2f(u['u_mouse'],mx,my);
${uniformSetCode}
gl.drawArrays(gl.TRIANGLES,0,6);
${animated ? 'requestAnimationFrame(r);' : ''}
}
r();
})();
</script>
</body>
</html>`
}

export function downloadHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
