// The uniform variable is set up in the javascript code and the same for all vertices
//uniform float orbRadius;
uniform float r;
uniform float R;

uniform float spottime;

out vec2 texCoord;

void main() {

   texCoord = uv;

   vec3 newPosition = position;

   float theta = 5.0 * spottime;
   float phi = 2.0 * spottime;

  // rotation here (before we scale!)
  // Tangents for parametric movement along the torus
  vec3 dTheta = normalize(vec3(-r * sin(theta) * cos(phi), -r * sin(theta) * sin(phi), r * cos(theta))); // forward direction 
  vec3 dPhi = normalize(vec3(-(R + r * cos(theta)) * sin(phi), (R + r * cos(theta)) * cos(phi), 0.0));

  //normal using cross product of tangents
  vec3 newNormal = normalize(cross(dPhi, dTheta));

  //mat3 rotationMatrix = mat3(dTheta, normalize(cross(newNormal, dTheta)), newNormal);
  mat3 rotationMatrix = mat3(dTheta, newNormal, normalize(cross(newNormal, dTheta)));

   newPosition = rotationMatrix * newPosition;

//   newPosition *= 0.03;
 
   // for torus
   vec3 parametricMovement;
  //  float r = 5.0;
  //  float R = 20.0;

  parametricMovement.x = ((R + r * cos(theta)) * cos(phi));
  parametricMovement.y = ((R + r * cos(theta)) * sin(phi));
  parametricMovement.z = r * sin(theta); 

  newPosition += parametricMovement;

   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
//    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    
}
