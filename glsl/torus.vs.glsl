// The uniform variable is set up in the javascript code and the same for all vertices

uniform vec3 planePos;
// out vec2 texCoord;
// out float intensity;
out vec3 vNormal; //for shading
out vec2 vUv;  //for texture

//for phong
out vec3 viewPosition;
out vec3 worldPosition;
out vec3 interpolatedNormal;

void main() {

    viewPosition = vec3(inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0));
    
    vec3 modelPosition = vec3(modelMatrix * vec4(position, 1.0));

    worldPosition = vec3(modelMatrix * vec4(position, 1.0));
    
    interpolatedNormal = normal;

    vNormal = normal;
    vUv = uv;

    // vec4 adjustedPlanePos = inverse(modelMatrix) * vec4(planePos, 1.0);
  
    // Calculate the light direction vector,normalize for consistency
    // use armadillo frame cuz its easier
    // vec3 lightDirection = normalize(adjustedPlanePos.xyz - position);

    // intensity = max(dot(normal, lightDirection),0.0);

    // texCoord = uv;

    // Multiply each vertex by the model matrix to get the world position of each vertex, 
    // then the view matrix to get the position in the camera coordinate system, 
    // and finally the projection matrix to get final vertex position.

    // add current orbPosition (updated in js file) to each vertex position 

    // vec3 adjusted_pos = position * 0.03;
    // adjusted_pos += orbPosition- vec3(0.0, 1.0, 0.0);

    // if (appleDistance < 2.0){

    //     adjusted_pos = position;

    // }

    // TODO: Make changes here to make the orb move as the light source
    //gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(adjusted_pos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
