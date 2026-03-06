precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_bgColor;

uniform float u_speed;
uniform float u_scale;
uniform float u_softness;
uniform float u_distortion;
uniform float u_parallax;

// Simplex 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Parallax
  vec2 mouseOffset = (u_mouse - 0.5) * u_parallax * 0.2;
  p += mouseOffset;

  float t = u_time * u_speed * 0.2;

  // Four blob centers moving on noise paths
  vec2 c1 = vec2(
    snoise(vec2(t * 0.7, 0.0)) * 0.6,
    snoise(vec2(0.0, t * 0.8)) * 0.5
  );
  vec2 c2 = vec2(
    snoise(vec2(t * 0.5 + 5.0, 3.0)) * 0.7,
    snoise(vec2(3.0, t * 0.6 + 5.0)) * 0.6
  );
  vec2 c3 = vec2(
    snoise(vec2(t * 0.6 + 10.0, 7.0)) * 0.5,
    snoise(vec2(7.0, t * 0.7 + 10.0)) * 0.7
  );
  vec2 c4 = vec2(
    snoise(vec2(t * 0.8 + 15.0, 11.0)) * 0.6,
    snoise(vec2(11.0, t * 0.5 + 15.0)) * 0.5
  );

  // Distortion field
  vec2 dp = p * u_scale;
  float distort = snoise(dp + t * 0.3) * u_distortion;
  vec2 pp = p + distort * 0.1;

  // Blob distances with softness control
  float d1 = exp(-length(pp - c1) * (3.0 / u_softness));
  float d2 = exp(-length(pp - c2) * (3.0 / u_softness));
  float d3 = exp(-length(pp - c3) * (3.0 / u_softness));
  float d4 = exp(-length(pp - c4) * (3.0 / u_softness));

  float total = d1 + d2 + d3 + d4 + 0.001;

  // Weighted color blend
  vec3 color = (u_color1 * d1 + u_color2 * d2 + u_color3 * d3 + u_color4 * d4) / total;

  // Blend to background at edges (where no blob dominates)
  float coverage = smoothstep(0.05, 0.4, total - 0.001);
  color = mix(u_bgColor, color, coverage);

  // Subtle grain
  float hash = fract(sin(dot(uv + fract(u_time), vec2(12.9898, 78.233))) * 43758.5453);
  color += (hash - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
