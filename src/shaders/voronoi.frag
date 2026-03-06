precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec3 u_cellColor;
uniform vec3 u_edgeColor;
uniform vec3 u_glowColor;
uniform vec3 u_bgColor;

uniform float u_speed;
uniform float u_cellScale;
uniform float u_edgeWidth;
uniform float u_refraction;
uniform float u_drift;
uniform float u_parallax;
uniform float u_edgeGlow;

vec2 hash2(vec2 p) {
  return vec2(
    fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
    fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Parallax
  vec2 mouseOffset = (u_mouse - 0.5) * u_parallax * 0.2;
  p += mouseOffset;

  float t = u_time * u_speed * 0.3;

  // Scale
  vec2 sp = p * u_cellScale;
  vec2 cell = floor(sp);
  vec2 frac = fract(sp);

  float minDist = 10.0;
  float secondDist = 10.0;
  vec2 closestPoint = vec2(0.0);
  vec2 closestCell = vec2(0.0);

  // Find two closest Voronoi points
  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      vec2 neighbor = vec2(float(dx), float(dy));
      vec2 rnd = hash2(cell + neighbor);

      // Animate cell points
      vec2 point = neighbor + rnd + vec2(
        sin(t * (0.5 + rnd.x) + rnd.y * 6.28) * u_drift * 0.4,
        cos(t * (0.4 + rnd.y) + rnd.x * 6.28) * u_drift * 0.4
      );

      float dist = length(frac - point);

      if (dist < minDist) {
        secondDist = minDist;
        minDist = dist;
        closestPoint = point;
        closestCell = cell + neighbor;
      } else if (dist < secondDist) {
        secondDist = dist;
      }
    }
  }

  // Edge detection: difference between closest and second closest
  float edge = secondDist - minDist;
  float edgeMask = 1.0 - smoothstep(0.0, u_edgeWidth, edge);

  // Cell color variation based on cell ID
  vec2 cellId = closestCell;
  float cellHash = fract(sin(dot(cellId, vec2(127.1, 311.7))) * 43758.5453);

  // Refraction-like color shift based on distance to center
  vec2 toCenter = frac - closestPoint;
  float refractShift = length(toCenter) * u_refraction;

  // Base cell color with variation
  vec3 baseCell = mix(u_cellColor, u_bgColor, cellHash * 0.3 + refractShift * 0.2);

  // Lighting — normal approximation from Voronoi distances
  vec3 normal = normalize(vec3(
    dFdx(minDist) * 20.0,
    dFdy(minDist) * 20.0,
    1.0
  ));

  vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
  float diff = max(dot(normal, lightDir), 0.0) * 0.5 + 0.5;

  // Specular
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 40.0) * 0.5;

  // Compose
  vec3 cellResult = baseCell * diff + spec * vec3(1.0, 0.98, 0.95);
  vec3 edgeResult = u_edgeColor;

  // Edge glow
  float glowMask = smoothstep(u_edgeWidth * 3.0, 0.0, edge);
  vec3 glow = u_glowColor * glowMask * u_edgeGlow;

  vec3 color = mix(cellResult, edgeResult, edgeMask) + glow;

  // Dither
  float dither = fract(sin(dot(uv + fract(u_time), vec2(12.9898, 78.233))) * 43758.5453);
  color += (dither - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
