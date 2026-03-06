import type { EffectConfig } from './config'
import { getBrightness } from './config'
import fluidVert from './shaders/fluid.vert'
import fluidFrag from './shaders/fluid.frag'

function escapeForTemplate(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

function rgbCSS(c: [number, number, number]): string {
  return `${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}`
}

export function generateExportHTML(config: EffectConfig, width: number, height: number, animated: boolean): string {
  const attrColor = getBrightness(config.bgColor) > 0.5 ? '#1a1a1a' : '#e0e0e0'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fluid Effect</title>
<style>
*{margin:0;padding:0}
body{background:rgb(${rgbCSS(config.bgColor)});overflow:hidden}
canvas{width:100vw;height:100vh;display:block}
.a{position:fixed;bottom:8px;right:12px;font:10px/1 -apple-system,system-ui,sans-serif;opacity:.3;color:${attrColor};pointer-events:none;user-select:none}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div class="a">Naren Katakam</div>
<script>
(function(){
const vs=\`${escapeForTemplate(fluidVert)}\`;
const fs=\`${escapeForTemplate(fluidFrag)}\`;
const c=document.getElementById('c');
const dpr=Math.min(devicePixelRatio,2);
c.width=${width}*dpr;c.height=${height}*dpr;
const gl=c.getContext('webgl',{antialias:false,alpha:false});
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
['u_resolution','u_time','u_mouse','u_colorA','u_colorB','u_colorC','u_bgColor',
'u_speed','u_complexity','u_zoom','u_elevation','u_glossiness',
'u_metallic','u_roughness','u_warpIntensity','u_parallax','u_fresnelStrength','u_envIntensity'
].forEach(n=>u[n]=gl.getUniformLocation(p,n));
gl.viewport(0,0,c.width,c.height);
const t0=performance.now();
let mx=0.5,my=0.5;
document.addEventListener('mousemove',e=>{mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight;});
function r(){
gl.uniform2f(u.u_resolution,c.width,c.height);
gl.uniform1f(u.u_time,(performance.now()-t0)*0.001);
gl.uniform2f(u.u_mouse,mx,my);
gl.uniform3fv(u.u_colorA,[${config.colorA.map(v => v.toFixed(4)).join(',')}]);
gl.uniform3fv(u.u_colorB,[${config.colorB.map(v => v.toFixed(4)).join(',')}]);
gl.uniform3fv(u.u_colorC,[${config.colorC.map(v => v.toFixed(4)).join(',')}]);
gl.uniform3fv(u.u_bgColor,[${config.bgColor.map(v => v.toFixed(4)).join(',')}]);
gl.uniform1f(u.u_speed,${config.speed.toFixed(4)});
gl.uniform1f(u.u_complexity,${config.complexity.toFixed(4)});
gl.uniform1f(u.u_zoom,${config.zoom.toFixed(4)});
gl.uniform1f(u.u_elevation,${config.elevation.toFixed(4)});
gl.uniform1f(u.u_glossiness,${config.glossiness.toFixed(4)});
gl.uniform1f(u.u_metallic,${config.metallic.toFixed(4)});
gl.uniform1f(u.u_roughness,${config.roughness.toFixed(4)});
gl.uniform1f(u.u_warpIntensity,${config.warpIntensity.toFixed(4)});
gl.uniform1f(u.u_parallax,${config.parallax.toFixed(4)});
gl.uniform1f(u.u_fresnelStrength,${config.fresnelStrength.toFixed(4)});
gl.uniform1f(u.u_envIntensity,${config.envIntensity.toFixed(4)});
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
