precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform vec3 u_bgColor;

uniform float u_speed;
uniform float u_complexity;
uniform float u_zoom;
uniform float u_elevation;
uniform float u_glossiness;
uniform float u_metallic;
uniform float u_roughness;
uniform float u_warpIntensity;
uniform float u_parallax;
uniform float u_fresnelStrength;
uniform float u_envIntensity;

// ============================================================
// Simplex 3D Noise — Ashima Arts (Stefan Gustavson)
// ============================================================

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ============================================================
// Surface: multi-octave domain-warped noise
// ============================================================

float surface(vec2 p) {
  // Parallax offset
  vec2 mouseOffset = (u_mouse - 0.5) * u_parallax * 0.3;
  p += mouseOffset;

  float t = u_time * u_speed * 0.15;
  vec3 p3 = vec3(p * u_zoom, t);

  // Layer 1: base noise
  float n1 = snoise(p3);

  // Layer 2: warped by n1 (forward time)
  float n2 = snoise(p3 + vec3(4.1, 2.3, t * 0.7) + n1 * u_warpIntensity);

  // Layer 3: warped by n2 (reverse time — creates churning)
  float n3 = snoise(p3 + vec3(1.2, 5.7, -t * 0.65) + n2 * u_warpIntensity);

  // Layer 4: fine detail
  float n4 = snoise(p3 * 2.0 + vec3(3.3, 1.1, t * 0.5) + n3 * u_warpIntensity * 0.5);

  return mix(n3, n4, 0.3);
}

// ============================================================
// Normal from height field
// ============================================================

vec3 getNormal(vec2 p) {
  float eps = 0.005;
  float dx = surface(p + vec2(eps, 0.0)) - surface(p - vec2(eps, 0.0));
  float dy = surface(p + vec2(0.0, eps)) - surface(p - vec2(0.0, eps));
  return normalize(vec3(-dx * u_elevation, -dy * u_elevation, 1.0));
}

// ============================================================
// PBR Helpers
// ============================================================

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  float denom = NdotH2 * (a2 - 1.0) + 1.0;
  return a2 / (3.14159265 * denom * denom + 0.0001);
}

float geometrySmith(float NdotV, float NdotL, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  float ggx1 = NdotV / (NdotV * (1.0 - k) + k);
  float ggx2 = NdotL / (NdotL * (1.0 - k) + k);
  return ggx1 * ggx2;
}

// Procedural environment — studio lighting
vec3 envReflection(vec3 reflectDir) {
  float y = reflectDir.y * 0.5 + 0.5;
  vec3 sky = mix(vec3(0.08, 0.08, 0.12), vec3(0.5, 0.55, 0.65), y);

  // Top panel — warm key
  float panel1 = smoothstep(0.65, 0.95, reflectDir.y) * smoothstep(-0.4, 0.4, reflectDir.x);
  // Bottom-side panel — cool fill
  float panel2 = smoothstep(-0.95, -0.5, reflectDir.y) * smoothstep(-0.6, 0.2, reflectDir.x);
  // Right edge — rim
  float panel3 = smoothstep(0.6, 0.9, reflectDir.x) * smoothstep(-0.3, 0.3, reflectDir.y);

  sky += vec3(1.0, 0.92, 0.85) * panel1 * 2.5;
  sky += vec3(0.6, 0.7, 1.0) * panel2 * 1.0;
  sky += vec3(0.9, 0.85, 0.8) * panel3 * 1.2;

  return sky * u_envIntensity;
}

// ============================================================
// Dithering
// ============================================================

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// ============================================================
// Main
// ============================================================

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float h = surface(p);
  vec3 normal = getNormal(p);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Three-color ramp
  float t = h * 0.5 + 0.5;
  vec3 baseColor;
  if (t < 0.5) {
    baseColor = mix(u_colorC, u_colorB, t * 2.0);
  } else {
    baseColor = mix(u_colorB, u_colorA, (t - 0.5) * 2.0);
  }

  // ---- Light directions ----
  vec3 keyDir = normalize(vec3(0.5, 0.8, 1.2));
  vec3 fillDir = normalize(vec3(-0.6, -0.4, 0.8));
  vec3 keyColor = vec3(1.0, 0.95, 0.9);
  vec3 fillColor = vec3(0.7, 0.8, 1.0);
  vec3 rimColor = vec3(1.0, 0.95, 0.85);

  // ---- Dielectric path ----
  float keyDiff = max(dot(normal, keyDir), 0.0);
  vec3 keyHalf = normalize(keyDir + viewDir);
  float keySpec = pow(max(dot(normal, keyHalf), 0.0), u_glossiness);

  float fillDiff = max(dot(normal, fillDir), 0.0);

  float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  float sss = smoothstep(-0.8, 0.8, h) * 0.3;
  float ao = smoothstep(-0.8, 0.2, h);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0) * u_fresnelStrength;

  vec3 dielectric = baseColor * (keyDiff * keyColor * 0.8 + fillDiff * fillColor * 0.3 + 0.15) * ao;
  dielectric += keySpec * keyColor * 0.6;
  dielectric += rim * rimColor * 0.4;
  dielectric += baseColor * sss;
  dielectric += fresnel * vec3(0.3);

  // ---- Metallic path (Cook-Torrance) ----
  vec3 F0 = mix(vec3(0.04), baseColor, u_metallic);
  vec3 pbrColor = vec3(0.0);

  // Key light PBR
  {
    vec3 L = keyDir;
    vec3 H = normalize(L + viewDir);
    float NdotL = max(dot(normal, L), 0.0);
    float NdotV = max(dot(normal, viewDir), 0.001);
    float D = distributionGGX(normal, H, max(u_roughness, 0.04));
    float G = geometrySmith(NdotV, NdotL, u_roughness);
    vec3 F = fresnelSchlick(max(dot(H, viewDir), 0.0), F0);
    vec3 specBRDF = (D * G * F) / (4.0 * NdotV * NdotL + 0.001);
    vec3 kD = (1.0 - F) * (1.0 - u_metallic);
    pbrColor += (kD * baseColor / 3.14159265 + specBRDF) * keyColor * NdotL;
  }

  // Fill light PBR
  {
    vec3 L = fillDir;
    vec3 H = normalize(L + viewDir);
    float NdotL = max(dot(normal, L), 0.0);
    vec3 F = fresnelSchlick(max(dot(H, viewDir), 0.0), F0);
    vec3 kD = (1.0 - F) * (1.0 - u_metallic);
    pbrColor += (kD * baseColor / 3.14159265) * fillColor * NdotL * 0.4;
  }

  // Environment reflection
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = envReflection(reflectDir);
  vec3 envFresnel = fresnelSchlick(max(dot(normal, viewDir), 0.0), F0);
  vec3 envContrib = envColor * envFresnel * mix(0.1, 1.0, u_metallic);

  vec3 metallic = (pbrColor + envContrib + rim * rimColor * 0.2) * ao;

  // ---- Blend dielectric / metallic ----
  vec3 color = mix(dielectric, metallic, u_metallic);

  // Dithering
  color += (hash(uv + fract(u_time)) - 0.5) * 0.015;

  gl_FragColor = vec4(color, 1.0);
}
