precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_texelSize;
uniform vec2 u_direction;

void main() {
  vec2 uv = gl_FragCoord.xy * u_texelSize;

  // 9-tap Gaussian
  float w0 = 0.227027;
  float w1 = 0.1945946;
  float w2 = 0.1216216;
  float w3 = 0.054054;
  float w4 = 0.016216;

  vec3 result = texture2D(u_texture, uv).rgb * w0;

  vec2 d1 = u_direction * u_texelSize * 1.0 * 2.0;
  vec2 d2 = u_direction * u_texelSize * 2.0 * 2.0;
  vec2 d3 = u_direction * u_texelSize * 3.0 * 2.0;
  vec2 d4 = u_direction * u_texelSize * 4.0 * 2.0;

  result += texture2D(u_texture, uv + d1).rgb * w1;
  result += texture2D(u_texture, uv - d1).rgb * w1;
  result += texture2D(u_texture, uv + d2).rgb * w2;
  result += texture2D(u_texture, uv - d2).rgb * w2;
  result += texture2D(u_texture, uv + d3).rgb * w3;
  result += texture2D(u_texture, uv - d3).rgb * w3;
  result += texture2D(u_texture, uv + d4).rgb * w4;
  result += texture2D(u_texture, uv - d4).rgb * w4;

  gl_FragColor = vec4(result, 1.0);
}
