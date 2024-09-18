// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier
in float intensity;
in float orbDistance;

//for halftone
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform vec2 resolution;

varying vec3 vNormal;  
varying vec2 vUv; 

void main() {
 	// TODO: Set final rendered colour to intensity (a grey level)

	//  // Normalize the normal and light direction
    // vec3 normal = normalize(vNormal);
    // vec3 light = normalize(lightDirection);

    // // Calculate the diffuse intensity (Lambertian shading)
    // float intensity = max(dot(normal, light), 0.0);


// cide
	vec2 p = vUv.st;
	float pixelSize = 1.0 / float(100.0);
	
	float dx = mod(p.x, pixelSize) - pixelSize*0.5;
	float dy = mod(p.y, pixelSize) - pixelSize*0.5;
	
	p.x -= dx;
	p.y -= dy;
	// vec3 col = texture2D(texture, p).rgb;
	
	vec3 col = intensity*vec3(1.0,1.0,1.0);

	float bright = 0.53*(col.r+col.g+col.b);
	
	float dist = sqrt(dx*dx + dy*dy);
	float rad = bright * pixelSize * 0.8;
	float m = step(dist, rad);

	vec3 lightPurple = vec3(0.8, 0.6, 1.0);  // Light purple (you can tweak these values)
	vec3 darkPurple = vec3(0.3, 0.1, 0.5);   // Dark purple (you can tweak these values)


	vec3 col2 = mix(darkPurple,lightPurple, m);
	gl_FragColor = vec4(col2, 1.0);

	// if (orbDistance < 2.0) {
	// 	gl_FragColor = vec4(intensity*vec3(0.0,1.0,0.0), 1.0); 
	// } else {
	// 	gl_FragColor = vec4(intensity*vec3(1.0,1.0,1.0), 1.0); 
	// }
}
