precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_bgColor;

uniform float u_speed;
uniform float u_waveCount;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_causticIntensity;
uniform float u_distortion;
uniform float u_parallax;

// Hash for pseudo-random wave sources
float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Parallax
  vec2 mouseOffset = (u_mouse - 0.5) * u_parallax * 0.2;
  p += mouseOffset;

  float t = u_time * u_speed * 0.5;

  // Sum waves from multiple sources
  float wave = 0.0;
  float caustic = 0.0;

  int count = int(u_waveCount);

  for (int i = 0; i < 12; i++) {
    if (i >= count) break;

    float fi = float(i);

    // Wave source position — slowly orbiting
    vec2 source = vec2(
      sin(t * 0.3 * hash(fi * 7.0 + 1.0) + fi * 2.4) * 0.8,
      cos(t * 0.25 * hash(fi * 13.0 + 3.0) + fi * 1.7) * 0.6
    );

    float dist = length(p - source);

    // Concentric wave from source
    float w = sin(dist * u_frequency - t * (1.0 + hash(fi) * 0.5)) * u_amplitude;
    w *= exp(-dist * 0.8); // Attenuate with distance
    wave += w;

    // Caustic pattern — interference creates bright spots
    float c = abs(sin(dist * u_frequency * 2.0 - t * 1.5 + fi * 0.7));
    c = pow(c, 3.0) * exp(-dist * 1.2);
    caustic += c;
  }

  // Normalize
  wave /= max(float(count) * 0.4, 1.0);
  caustic /= max(float(count) * 0.3, 1.0);

  // Distortion on the wave pattern
  float n = wave + sin(p.x * 5.0 + t) * sin(p.y * 5.0 - t * 0.7) * u_distortion * 0.1;

  // Base color from wave height
  float colorMix = n * 0.5 + 0.5;
  vec3 baseColor = mix(u_colorA, u_colorB, colorMix);

  // Caustic highlights
  vec3 causticColor = vec3(1.0, 0.98, 0.95) * caustic * u_causticIntensity;

  // Surface normal from wave gradient (for subtle lighting)
  float eps = 0.005;
  vec2 px = p + vec2(eps, 0.0);
  vec2 py = p + vec2(0.0, eps);

  // Simple gradient approximation
  float wx = sin(length(px) * u_frequency - t) - sin(length(p) * u_frequency - t);
  float wy = sin(length(py) * u_frequency - t) - sin(length(p) * u_frequency - t);
  vec3 normal = normalize(vec3(-wx * 3.0, -wy * 3.0, 1.0));

  // Simple lighting
  vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
  float diff = max(dot(normal, lightDir), 0.0) * 0.3 + 0.7;

  // Compose
  vec3 color = baseColor * diff + causticColor;

  // Blend to background
  float edge = smoothstep(1.2, 0.0, length(p));
  color = mix(u_bgColor, color, edge);

  // Dither
  float dither = fract(sin(dot(uv + fract(u_time), vec2(12.9898, 78.233))) * 43758.5453);
  color += (dither - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
