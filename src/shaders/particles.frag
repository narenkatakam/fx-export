precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec3 u_particleColor;
uniform vec3 u_lineColor;
uniform vec3 u_bgColor;

uniform float u_speed;
uniform float u_particleSize;
uniform float u_density;
uniform float u_connectDistance;
uniform float u_drift;
uniform float u_parallax;
uniform float u_glow;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  return vec2(
    fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
    fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = gl_FragCoord.xy / u_resolution.y; // Uniform scaling

  // Parallax
  vec2 mouseOffset = (u_mouse - 0.5) * u_parallax * 0.15;
  p += mouseOffset;

  float t = u_time * u_speed * 0.3;

  // Grid-based particle system
  float gridSize = 1.0 / u_density;
  vec3 color = u_bgColor;

  float minDist = 1000.0;
  vec2 closestParticle = vec2(0.0);

  // Check surrounding cells for particles and connections
  vec2 cell = floor(p / gridSize);

  // First pass: find closest particle and draw connections
  for (int dx = -2; dx <= 2; dx++) {
    for (int dy = -2; dy <= 2; dy++) {
      vec2 neighbor = cell + vec2(float(dx), float(dy));
      vec2 rnd = hash2(neighbor);

      // Particle position within cell + drift
      vec2 particlePos = (neighbor + rnd) * gridSize;
      particlePos += vec2(
        sin(t * (0.5 + rnd.x * 0.5) + rnd.y * 6.28) * u_drift * gridSize * 0.4,
        cos(t * (0.4 + rnd.y * 0.6) + rnd.x * 6.28) * u_drift * gridSize * 0.4
      );

      float dist = length(p - particlePos);
      if (dist < minDist) {
        minDist = dist;
        closestParticle = particlePos;
      }

      // Draw connections to nearby particles
      for (int ex = -2; ex <= 2; ex++) {
        for (int ey = -2; ey <= 2; ey++) {
          if (dx == 0 && dy == 0 && ex == 0 && ey == 0) continue;
          vec2 other = cell + vec2(float(ex), float(ey));
          if (other == neighbor) continue;

          vec2 rnd2 = hash2(other);
          vec2 otherPos = (other + rnd2) * gridSize;
          otherPos += vec2(
            sin(t * (0.5 + rnd2.x * 0.5) + rnd2.y * 6.28) * u_drift * gridSize * 0.4,
            cos(t * (0.4 + rnd2.y * 0.6) + rnd2.x * 6.28) * u_drift * gridSize * 0.4
          );

          float pDist = length(particlePos - otherPos);
          float connectDist = u_connectDistance * gridSize;

          if (pDist < connectDist) {
            // Distance from point to line segment
            vec2 pa = p - particlePos;
            vec2 ba = otherPos - particlePos;
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            float lineDist = length(pa - ba * h);

            float lineWidth = 0.001;
            float lineAlpha = smoothstep(lineWidth * 2.0, lineWidth * 0.5, lineDist);
            lineAlpha *= (1.0 - pDist / connectDist) * 0.3;

            color = mix(color, u_lineColor, lineAlpha);
          }
        }
      }
    }
  }

  // Draw particle (soft circle)
  float particleRadius = u_particleSize * gridSize * 0.15;
  float particleAlpha = smoothstep(particleRadius, particleRadius * 0.3, minDist);

  // Glow
  float glowAlpha = exp(-minDist / (particleRadius * 4.0)) * u_glow * 0.5;

  color = mix(color, u_particleColor, glowAlpha);
  color = mix(color, u_particleColor, particleAlpha);

  // Dither
  float dither = fract(sin(dot(uv + fract(u_time), vec2(12.9898, 78.233))) * 43758.5453);
  color += (dither - 0.5) * 0.01;

  gl_FragColor = vec4(color, 1.0);
}
