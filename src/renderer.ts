import bloomFrag from './shaders/bloom.frag'
import brightFrag from './shaders/bright.frag'
import compositeFrag from './shaders/composite.frag'
import type { EffectDef, ParamDef } from './registry'

interface ShaderProgram {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
}

interface Framebuffer {
  fb: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}

export class Renderer {
  private gl: WebGLRenderingContext
  private canvas: HTMLCanvasElement
  private effectShader: ShaderProgram | null = null
  private brightShader!: ShaderProgram
  private bloomShaderH!: ShaderProgram
  private bloomShaderV!: ShaderProgram
  private compositeShader!: ShaderProgram
  private sceneFB!: Framebuffer
  private brightFB!: Framebuffer
  private bloomFBA!: Framebuffer
  private bloomFBB!: Framebuffer
  private quadBuffer!: WebGLBuffer
  private currentEffect: EffectDef | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
    if (!gl) throw new Error('WebGL not supported')
    this.gl = gl

    // Enable OES_standard_derivatives for dFdx/dFdy in Voronoi shader
    gl.getExtension('OES_standard_derivatives')

    this.initQuad()
    this.initBloomShaders()
    this.resize()
  }

  private initBloomShaders() {
    const passVert = 'attribute vec2 a_position;\nvoid main(){gl_Position=vec4(a_position,0.0,1.0);}'

    this.brightShader = this.createProgram(passVert, brightFrag, [
      'u_texture', 'u_texelSize', 'u_threshold',
    ])
    this.bloomShaderH = this.createProgram(passVert, bloomFrag, [
      'u_texture', 'u_texelSize', 'u_direction',
    ])
    this.bloomShaderV = this.createProgram(passVert, bloomFrag, [
      'u_texture', 'u_texelSize', 'u_direction',
    ])
    this.compositeShader = this.createProgram(passVert, compositeFrag, [
      'u_scene', 'u_bloom', 'u_texelSize', 'u_bloomIntensity',
    ])
  }

  loadEffect(effect: EffectDef) {
    if (this.currentEffect?.id === effect.id) return

    // Clean up old shader
    if (this.effectShader) {
      this.gl.deleteProgram(this.effectShader.program)
    }

    // Build uniform name list from params + always-present globals
    const uniformNames = ['u_resolution', 'u_time', 'u_mouse']
    for (const p of effect.params) {
      if (!uniformNames.includes(p.key)) uniformNames.push(p.key)
    }

    this.effectShader = this.createProgram(effect.vertShader, effect.fragShader, uniformNames)
    this.currentEffect = effect
  }

  private createProgram(vertSrc: string, fragSrc: string, uniformNames: string[]): ShaderProgram {
    const gl = this.gl
    const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc)
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc)

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program)
      throw new Error('Shader link failed: ' + info)
    }

    // Clean up shader objects
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    const uniforms: Record<string, WebGLUniformLocation | null> = {}
    for (const name of uniformNames) {
      uniforms[name] = gl.getUniformLocation(program, name)
    }

    return { program, uniforms }
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error('Shader compile failed: ' + info)
    }

    return shader
  }

  private initQuad() {
    const gl = this.gl
    this.quadBuffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW)
  }

  private createFramebuffer(width: number, height: number): Framebuffer {
    const gl = this.gl
    const texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return { fb, texture, width, height }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = Math.floor(this.canvas.clientWidth * dpr)
    const height = Math.floor(this.canvas.clientHeight * dpr)

    if (this.canvas.width === width && this.canvas.height === height) return

    this.canvas.width = width
    this.canvas.height = height

    this.sceneFB = this.createFramebuffer(width, height)
    const bw = Math.floor(width / 2)
    const bh = Math.floor(height / 2)
    this.brightFB = this.createFramebuffer(bw, bh)
    this.bloomFBA = this.createFramebuffer(bw, bh)
    this.bloomFBB = this.createFramebuffer(bw, bh)
  }

  private useProgram(shader: ShaderProgram) {
    const gl = this.gl
    gl.useProgram(shader.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
    const posAttr = gl.getAttribLocation(shader.program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)
  }

  private drawQuad() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
  }

  private bindFB(fb: Framebuffer | null) {
    const gl = this.gl
    if (fb) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb.fb)
      gl.viewport(0, 0, fb.width, fb.height)
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  private bindTexture(texture: WebGLTexture, unit: number) {
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
  }

  render(
    values: Record<string, number | [number, number, number]>,
    params: ParamDef[],
    time: number,
    mouse: { x: number; y: number },
    bloomIntensity: number,
    useBloom: boolean,
  ) {
    if (!this.effectShader) return
    const gl = this.gl
    this.resize()

    const u = this.effectShader.uniforms

    // Render effect
    if (useBloom && bloomIntensity > 0) {
      this.useProgram(this.effectShader)
      this.bindFB(this.sceneFB)
    } else {
      this.useProgram(this.effectShader)
      this.bindFB(null)
    }

    // Global uniforms
    gl.uniform2f(u.u_resolution, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.u_time, time)
    gl.uniform2f(u.u_mouse, mouse.x, mouse.y)

    // Dynamic uniforms from effect params
    for (const p of params) {
      const val = values[p.key] ?? p.default
      if (p.type === 'color') {
        const c = val as [number, number, number]
        gl.uniform3fv(u[p.key], c)
      } else {
        gl.uniform1f(u[p.key], val as number)
      }
    }

    this.drawQuad()

    // Bloom post-processing (only for effects that need it)
    if (useBloom && bloomIntensity > 0) {
      // Bright extract
      this.useProgram(this.brightShader)
      this.bindFB(this.brightFB)
      this.bindTexture(this.sceneFB.texture, 0)
      gl.uniform1i(this.brightShader.uniforms.u_texture, 0)
      gl.uniform2f(this.brightShader.uniforms.u_texelSize, 1.0 / this.brightFB.width, 1.0 / this.brightFB.height)
      gl.uniform1f(this.brightShader.uniforms.u_threshold, 0.7)
      this.drawQuad()

      // Horizontal blur
      this.useProgram(this.bloomShaderH)
      this.bindFB(this.bloomFBA)
      this.bindTexture(this.brightFB.texture, 0)
      gl.uniform1i(this.bloomShaderH.uniforms.u_texture, 0)
      gl.uniform2f(this.bloomShaderH.uniforms.u_texelSize, 1.0 / this.bloomFBA.width, 1.0 / this.bloomFBA.height)
      gl.uniform2f(this.bloomShaderH.uniforms.u_direction, 1.0, 0.0)
      this.drawQuad()

      // Vertical blur
      this.useProgram(this.bloomShaderV)
      this.bindFB(this.bloomFBB)
      this.bindTexture(this.bloomFBA.texture, 0)
      gl.uniform1i(this.bloomShaderV.uniforms.u_texture, 0)
      gl.uniform2f(this.bloomShaderV.uniforms.u_texelSize, 1.0 / this.bloomFBB.width, 1.0 / this.bloomFBB.height)
      gl.uniform2f(this.bloomShaderV.uniforms.u_direction, 0.0, 1.0)
      this.drawQuad()

      // Composite
      this.useProgram(this.compositeShader)
      this.bindFB(null)
      this.bindTexture(this.sceneFB.texture, 0)
      this.bindTexture(this.bloomFBB.texture, 1)
      gl.uniform1i(this.compositeShader.uniforms.u_scene, 0)
      gl.uniform1i(this.compositeShader.uniforms.u_bloom, 1)
      gl.uniform2f(this.compositeShader.uniforms.u_texelSize, 1.0 / this.canvas.width, 1.0 / this.canvas.height)
      gl.uniform1f(this.compositeShader.uniforms.u_bloomIntensity, bloomIntensity)
      this.drawQuad()
    }
  }
}
