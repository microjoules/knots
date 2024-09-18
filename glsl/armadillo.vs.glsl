// The uniform variable is set up in the javascript code and the same for all vertices
uniform vec3 orbPosition;
//uniform float orbRadius;
uniform float appleDistance;
uniform float r;
uniform float R;

uniform float time;

// This is a "varying" variable and interpolated between vertices and across fragments.
// The shared variable is initialized in the vertex shader and passed to the fragment shader.
out float intensity;
out float orbDistance;

//to be passed to fragment shader for halftone
out vec3 vNormal; //for shading
out vec2 vUv;  //for texture

void main() {

  // TODO: Make changes here for part b, c, d
    // HINT: GLSL PROVIDES THE DOT() FUNCTION
  	// HINT: INTENSITY IS CALCULATED BY TAKING THE DOT PRODUCT OF THE NORMAL AND LIGHT DIRECTION VECTORS\
    //convert orbPosition to armadillo frame 
    vec4 adjustedOrb = inverse(modelMatrix) * vec4(orbPosition, 1.0);
  
    // Calculate the light direction vector,normalize for consistency
    // use armadillo frame cuz its easier
    vec3 lightDirection = normalize(adjustedOrb.xyz - position);


    intensity = max(dot(normal, lightDirection),0.0);

    vec3 newPosition = position;


  float theta = 3.0 * time;
   float phi = 2.0 * time;

 
   
  // rotation here (before we scale!)
  // Tangents for parametric movement along the torus
  //vec3 dTheta = normalize(vec3(-r * sin(theta) * cos(phi), -r * sin(theta) * sin(phi), r * cos(theta)));
  //vec3 dPhi = normalize(vec3(-(R + r * cos(theta)) * sin(phi), (R + r * cos(theta)) * cos(phi), 0.0));
   
   vec3 dTheta = normalize(vec3(-cos(phi)*sin(theta), -sin(theta)*sin(phi), cos(theta)));
   vec3 dPhi = normalize(vec3(-sin(phi), cos(phi), 0.0));

  //normal using cross product of tangents
  vec3 newNormal = normalize(cross(dPhi, dTheta));

  //mat3 rotationMatrix = mat3(dTheta, normalize(cross(newNormal, dTheta)), newNormal);
  mat3 rotationMatrix = mat3(dTheta, newNormal, cross(newNormal, dTheta));

   newPosition = rotationMatrix * newPosition;

  newPosition *= 0.05;
 
   // for torus
   vec3 parametricMovement;
  //  float r = 5.0;
  //  float R = 20.0;

  parametricMovement.x = ((R + r * cos(theta)) * cos(phi));
  parametricMovement.y = ((R + r * cos(theta)) * sin(phi));
  parametricMovement.z = r * sin(theta); 

  newPosition += parametricMovement;

   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
    
}
