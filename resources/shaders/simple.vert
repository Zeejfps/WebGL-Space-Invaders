attribute vec3 position;
attribute vec2 vertUV;

varying vec2 fragUV;
uniform mat4 mvp;

void main() {
     fragUV = vertUV;
     gl_Position =  mvp * vec4(position, 1);
}
