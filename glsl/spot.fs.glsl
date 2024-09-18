// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier
uniform sampler2D spotcolorMap;

in vec2 texCoord;

void main() {

vec4 textureColor = texture2D(spotcolorMap, texCoord);

    gl_FragColor = textureColor;
}
