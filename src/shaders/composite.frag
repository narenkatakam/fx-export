precision highp float;

uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform vec2 u_texelSize;
uniform float u_bloomIntensity;

void main() {
  vec2 uv = gl_FragCoord.xy * u_texelSize;

  vec3 scene = texture2D(u_scene, uv).rgb;
  vec3 bloom = texture2D(u_bloom, uv).rgb;

  vec3 color = scene + bloom * u_bloomIntensity;

  // Reinhard tonemap
  color = color / (color + 1.0);

  gl_FragColor = vec4(color, 1.0);
}
