import fluidVert from './shaders/fluid.vert'
import fluidFrag from './shaders/fluid.frag'
import bloomFrag from './shaders/bloom.frag'
import brightFrag from './shaders/bright.frag'
import compositeFrag from './shaders/composite.frag'
import type { EffectConfig } from './config'

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
  private fluidShader!: ShaderProgram
  private brightShader!: ShaderProgram
  private bloomShaderH!: ShaderProgram
  private bloomShaderV!: ShaderProgram
  private compositeShader!: ShaderProgram
  private sceneFB!: Framebuffer
  private brightFB!: Framebuffer
  private bloomFBA!: Framebuffer
  private bloomFBB!: Framebuffer
  private quadBuffer!: WebGLBuffer

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
    if (!gl) throw new Error('WebGL not supported')
    this.gl = gl

    this.initShaders()
    this.initQuad()
    this.resize()
  }

  private initShaders() {
    const gl = this.gl
    const passVert = fluidVert // reuse simple vertex shader for all passes

    this.fluidShader = this.createProgram(passVert, fluidFrag, [
      'u_resolution', 'u_time', 'u_mouse',
      'u_colorA', 'u_colorB', 'u_colorC', 'u_bgColor',
      'u_speed', 'u_complexity', 'u_zoom', 'u_elevation', 'u_glossiness',
      'u_metallic', 'u_roughness', 'u_warpIntensity',
      'u_parallax', 'u_fresnelStrength', 'u_envIntensity',
    ])

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
    const gl = this.gl
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = Math.floor(this.canvas.clientWidth * dpr)
    const height = Math.floor(this.canvas.clientHeight * dpr)

    if (this.canvas.width === width && this.canvas.height === height) return

    this.canvas.width = width
    this.canvas.height = height

    // Full-res scene buffer
    this.sceneFB = this.createFramebuffer(width, height)

    // Half-res bloom buffers
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

  render(config: EffectConfig, time: number, mouse: { x: number; y: number }) {
    const gl = this.gl
    this.resize()

    const u = this.fluidShader.uniforms

    // ---- Pass 1: Render fluid to scene buffer ----
    this.useProgram(this.fluidShader)
    this.bindFB(this.sceneFB)

    gl.uniform2f(u.u_resolution, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.u_time, time)
    gl.uniform2f(u.u_mouse, mouse.x, mouse.y)
    gl.uniform3fv(u.u_colorA, config.colorA)
    gl.uniform3fv(u.u_colorB, config.colorB)
    gl.uniform3fv(u.u_colorC, config.colorC)
    gl.uniform3fv(u.u_bgColor, config.bgColor)
    gl.uniform1f(u.u_speed, config.speed)
    gl.uniform1f(u.u_complexity, config.complexity)
    gl.uniform1f(u.u_zoom, config.zoom)
    gl.uniform1f(u.u_elevation, config.elevation)
    gl.uniform1f(u.u_glossiness, config.glossiness)
    gl.uniform1f(u.u_metallic, config.metallic)
    gl.uniform1f(u.u_roughness, config.roughness)
    gl.uniform1f(u.u_warpIntensity, config.warpIntensity)
    gl.uniform1f(u.u_parallax, config.parallax)
    gl.uniform1f(u.u_fresnelStrength, config.fresnelStrength)
    gl.uniform1f(u.u_envIntensity, config.envIntensity)

    this.drawQuad()

    // ---- Pass 2: Extract bright pixels ----
    this.useProgram(this.brightShader)
    this.bindFB(this.brightFB)
    this.bindTexture(this.sceneFB.texture, 0)
    gl.uniform1i(this.brightShader.uniforms.u_texture, 0)
    gl.uniform2f(this.brightShader.uniforms.u_texelSize, 1.0 / this.brightFB.width, 1.0 / this.brightFB.height)
    gl.uniform1f(this.brightShader.uniforms.u_threshold, 0.7)
    this.drawQuad()

    // ---- Pass 3: Horizontal blur ----
    this.useProgram(this.bloomShaderH)
    this.bindFB(this.bloomFBA)
    this.bindTexture(this.brightFB.texture, 0)
    gl.uniform1i(this.bloomShaderH.uniforms.u_texture, 0)
    gl.uniform2f(this.bloomShaderH.uniforms.u_texelSize, 1.0 / this.bloomFBA.width, 1.0 / this.bloomFBA.height)
    gl.uniform2f(this.bloomShaderH.uniforms.u_direction, 1.0, 0.0)
    this.drawQuad()

    // ---- Pass 4: Vertical blur ----
    this.useProgram(this.bloomShaderV)
    this.bindFB(this.bloomFBB)
    this.bindTexture(this.bloomFBA.texture, 0)
    gl.uniform1i(this.bloomShaderV.uniforms.u_texture, 0)
    gl.uniform2f(this.bloomShaderV.uniforms.u_texelSize, 1.0 / this.bloomFBB.width, 1.0 / this.bloomFBB.height)
    gl.uniform2f(this.bloomShaderV.uniforms.u_direction, 0.0, 1.0)
    this.drawQuad()

    // ---- Pass 5: Composite to screen ----
    this.useProgram(this.compositeShader)
    this.bindFB(null)

    this.bindTexture(this.sceneFB.texture, 0)
    this.bindTexture(this.bloomFBB.texture, 1)
    gl.uniform1i(this.compositeShader.uniforms.u_scene, 0)
    gl.uniform1i(this.compositeShader.uniforms.u_bloom, 1)
    gl.uniform2f(this.compositeShader.uniforms.u_texelSize, 1.0 / this.canvas.width, 1.0 / this.canvas.height)
    gl.uniform1f(this.compositeShader.uniforms.u_bloomIntensity, config.bloom)

    this.drawQuad()
  }

  getShaderSource(): { vert: string; frag: string } {
    return { vert: fluidVert, frag: fluidFrag }
  }
}
