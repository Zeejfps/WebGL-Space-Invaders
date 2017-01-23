precision mediump float;

varying vec2 fragUV;
uniform sampler2D sampler;

void main() {
     vec4 color = texture2D(sampler, fragUV);
     gl_FragColor = color;
}
