in vec3 vNormal; // for shading
in vec2 vUv;  // for texture

in vec3 interpolatedNormal;
in vec3 viewPosition;
in vec3 worldPosition;

uniform sampler2D colorMap;
uniform vec3 ambientColor;
uniform float kAmbient;

uniform vec3 diffuseColor;
uniform float kDiffuse;

uniform vec3 specularColor;
uniform float kSpecular;
uniform float shininess;
uniform vec3 planePos;
uniform mat4 modelMatrix;

// Function definitions
vec3 calculateAmbient(){
    return ambientColor * kAmbient;
}

vec3 calculateDiffuse(vec3 normal, vec3 lightDirection){
    vec3 N = normalize(normal);
    vec3 L = normalize(lightDirection);
    return kDiffuse * diffuseColor * max(dot(N, L), 0.0);
}

vec3 calculateSpecular(vec3 normal, vec3 lightDirection){
    vec3 N = normalize(normal);
    vec3 L = normalize(lightDirection);
    vec3 V = normalize(viewPosition - worldPosition); // View direction = viewPosition - worldPosition
    vec3 H = normalize(L + V); // H is halfway between L and V

    float intensity = max(dot(H, N), 0.0);
    return kSpecular * specularColor * pow(intensity, shininess);
}

void main() {
    vec3 normal = normalize(mat3(transpose(inverse(modelMatrix))) * interpolatedNormal);
    vec3 lightDirection = normalize(planePos - worldPosition);

    // Calculate lighting components
    vec3 out_Ambient = calculateAmbient();
    vec3 out_Diffuse = calculateDiffuse(normal, lightDirection);
    vec3 out_Specular = calculateSpecular(normal, lightDirection);

    vec3 out_Color = out_Ambient + out_Diffuse + out_Specular;

    // Basic halftoning logic (grid-based shading)
    vec2 p = vUv.st;
    float pixelSize = 1.0 / float(100.0);
    
    float dx = mod(p.x, pixelSize) - pixelSize * 0.5;
    float dy = mod(p.y, pixelSize) - pixelSize * 0.5;
    
    p.x -= dx;
    p.y -= dy;
    
    vec3 col = out_Color;
    float bright = 0.53 * (col.r + col.g + col.b);
    
    float dist = sqrt(dx * dx + dy * dy);
    float rad = bright * pixelSize * 0.8;
    float m = step(dist, rad);

    // Halftone coloring: light and dark purple
    vec3 lightPurple = vec3(0.8, 0.6, 1.0);
    vec3 darkPurple = vec3(0.3, 0.1, 0.5);
    vec3 col2 = mix(darkPurple, lightPurple, m);

    gl_FragColor = vec4(col2, 1.0);
    gl_FragColor = vec4(out_Color, 1.0);

    // Additional texture-based shading (optional, you can uncomment this)
    // vec4 textureColor = texture2D(colorMap, vUv);
    // gl_FragColor = textureColor;

}
