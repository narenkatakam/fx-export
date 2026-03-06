precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_texelSize;
uniform float u_threshold;

void main() {
  vec2 uv = gl_FragCoord.xy * u_texelSize;
  vec3 color = texture2D(u_texture, uv).rgb;

  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float contribution = max(brightness - u_threshold, 0.0) / max(brightness, 0.0001);

  gl_FragColor = vec4(color * contribution, 1.0);
}
