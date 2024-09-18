/*
 * UBC CPSC 314, Vjan2024
 * Assignment 1 Template
 */

// Setup and return the scene and related objects.
// You should look into js/setup.js to see what exactly is done here.
const {
  renderer,
  scene,
  camera,
  worldFrame,
} = setup();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Initialize uniforms
let time = { type: 'f', value: 0.0 };
let spottime = { type: 'f', value: 0.0 };
let R = { type: 'f', value: 20.0 };
let r = { type: 'f', value: 5.0 };
let planePos = { type: 'vec3', value: new THREE.Vector3() };

const ambientColor = { type: 'c', value: new THREE.Color(0.0, 0.0, 1.0) };
const diffuseColor = { type: 'c', value: new THREE.Color(0.0, 1.0, 1.0) };
const specularColor = { type: 'c', value: new THREE.Color(1.0, 1.0, 1.0) };
const lightColor = { type: 'c', value: new THREE.Color(1.0, 1.0, 1.0) };

const kAmbient = { type: "f", value: 0.6 };
const kDiffuse = { type: "f", value: 0.6 };
const kSpecular = { type: "f", value: 1.0 };
const shininess = { type: "f", value: 10.0 };
const ticks = { type: "f", value: 0.0 };

const torusTexture = new THREE.TextureLoader().load('images/cobblestone_floor_diff.jpg');
const torusMap = {type: 'sampler2D', value: torusTexture};


const torusMaterial = new THREE.ShaderMaterial({
  uniforms: {
    planePos: planePos,
    colorMap: torusMap,
    ambientColor: ambientColor,
    diffuseColor: diffuseColor,
    specularColor: specularColor,
    kAmbient: kAmbient,
    kDiffuse: kDiffuse,
    kSpecular: kSpecular,
    shininess: shininess
  }
});

// Load shaders.
const shaderFiles = [
  'glsl/torus.vs.glsl',
  'glsl/torus.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function (shaders) {
  torusMaterial.vertexShader = shaders['glsl/torus.vs.glsl'];
  torusMaterial.fragmentShader = shaders['glsl/torus.fs.glsl'];
});

const size = 8; // Number of gradient steps
const colors = new Uint8Array(size);

//
// Define colors in the array (green to blue gradient)
// Uint8Array requires values between 0-255 (representing color intensities)
colors[0] = 0;    // dark green (0, 255, 0) - fully green
colors[1] = 64;   // mix of green and a bit of blue
colors[2] = 128;  // equal green and blue
colors[3] = 192;  // more blue, less green
colors[4] = 255;  // fully blue (0, 0, 255)

// Create a DataTexture using the colors array
const gradientMap = new THREE.DataTexture(colors, size, 1, THREE.LuminanceFormat);

mat = new THREE.MeshToonMaterial({
  color: 0x44aa88,   // Base color of the material
  gradientMap: gradientMap  // Default toon shading; can use a custom gradient map
});

let mixer;  // Declare the animation mixer
let plane;



//load plane
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('obj/plane.gltf', function (gltf) {
  // Get the scene from the gltf object
  plane = gltf.scene;

  // Scale, position, and rotation adjustments
  plane.scale.set(0.3, 0.3, 0.3);
  // plane.position.set(3.0, 0, 0);

  // Add the GLTF plane to the scene
  plane.parent = worldFrame;
  scene.add(plane);

  // Set up the animation mixer and play the animation
  mixer = new THREE.AnimationMixer(plane);
  const action = mixer.clipAction(gltf.animations[0]); // Get the first animation
  action.play();
});



//TORUS
const torusGeometry = new THREE.TorusGeometry(20,5,50,100);
const torus = new THREE.Mesh(torusGeometry, mat);
// torus.position.set(0.0,1.0,0.0);
torus.parent = worldFrame;
scene.add(torus);

//lighting
// PointLight( color , intensity, distance , decay )
const sphereLight = new THREE.PointLight('0xff0000', 1, 80);
// const sphereLight = new THREE.PointLight(0xff0000, 1, 100);
// sphereLight.position.set(0.0, 1.0, 0.0);
scene.add(sphereLight);

//lighting
//hemilight(skycolor, groundcolor, intensity)
const light = new THREE.HemisphereLight( 'lightgreen', 'lightblue', 0.3 ); 
light.position.set(0.0, 0.0, 50.0);
scene.add(light);



let p = 3.0;
let q = 2.0;


const dashMaterial = new THREE.LineDashedMaterial({
  color: 'black',    
  dashSize: 0.5,        
  gapSize: 1.0,       
  linewidth: 1,    
  scale: 1.0,
});

const maxPoints = 1000; // Max points for the path

// Declare global variables for path geometry and line
let pathLine, pathGeometry;

// Function to create or update the dashed path
function updatePath() {
  // Remove the previous pathLine from the scene if it exists
  if (pathLine) {
    scene.remove(pathLine);
  }

  // Create a new array for points
  const points = [];

  // Generate new points for the parametric path
  for (let i = 0; i < maxPoints; i++) {
    const t = i / (maxPoints - 1) * Math.PI * 2; // Adjust the parametric step
    const theta = p * t;
    const phi = q * t;
    let R = 20.0;
    let r = 6.0;

    const offsetR = R;
    const x = (offsetR + r * Math.cos(theta)) * Math.cos(phi);
    const y = (offsetR + r * Math.cos(theta)) * Math.sin(phi);
    const z = r * Math.sin(theta);

    points.push(new THREE.Vector3(x, y, z));
  }

  // Create or update geometry with the new points
  pathGeometry = new THREE.BufferGeometry().setFromPoints(points);

  // Create a new line with the updated geometry
  pathLine = new THREE.Line(pathGeometry, dashMaterial);
  pathLine.computeLineDistances(); // Recalculate distances for dashed effect

  // Add the new line to the scene
  scene.add(pathLine);
}

// Initial path creation
updatePath();


// FOR USER INPUTS OF P AND Q
const gui = new dat.GUI();

// Add controls for p and q
const controls = {
  p: p,
  q: q
};

//update title
function updateTitle() {
  const titleElement = document.querySelector('.sub-title');

  // Update the content inside the div
    titleElement.innerHTML = ` (${p}, ${q})-torus knot`;

  //   if ((p == 3.0 && q == 2.0)) {
  //     const knotElement = document.querySelector('.knot-title');

  // // Update the content inside the div
  //   knotElement.innerHTML = `TREFOIL`;
  //   } else {
  //     const knotElement = document.querySelector('.knot-title');
  //     knotElement.innerHTML = ``;
  //   }
  
}



//draw projection
function draw2DProjection(p, q) {
  const canvas = document.getElementById('knotCanvas');
  const ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const points = [];
  const maxPoints = 500; // Higher for smoother curves
  let R = 20.0;
  let r = 6.0;
  const scalefactor = 0.70;

  // Generate the 2D top-down projection points
  for (let i = 0; i < maxPoints; i++) {
    const t = (i / (maxPoints - 1)) * Math.PI * 2; // Parametric step
    const theta = p * t;
    const phi = q * t;
    
    // Projection onto XY plane (ignoring Z)
    const x = scalefactor * (R + r * Math.cos(theta)) * Math.cos(phi);
    const y = scalefactor * (R + r * Math.cos(theta)) * Math.sin(phi);
    
    // Scale and offset for canvas
    const scaleFactor = 5;  // Adjust this for sizing
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;
    
    points.push({ x: offsetX + scaleFactor * x, y: offsetY - scaleFactor * y });
  }

  // Draw the knot on the canvas
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}


//force integer values
const step = 1.0;
gui.add(controls, 'p', 0, 10, step).name('p').onChange(function(value) {
  p = value;
  updatePath();
  updateTitle();
  draw2DProjection(p, q);
});

gui.add(controls, 'q', 0, 10, step).name('q').onChange(function(value) {
  // Update phi in your scene if needed
  // You might want to adjust this according to your needs
  q = value;
  updatePath();
  updateTitle();
  draw2DProjection(p, q);
});


updateTitle();
draw2DProjection(p, q);

  // PLANE MOVEMENT
function planeMovement() {

  let parametricMovement = new THREE.Vector3();

  let theta = p * time.value;
  let phi = q * time.value;
  let R = 20.0;
  let r =  6.0;

  parametricMovement.x = ((R + r * Math.cos(theta)) * Math.cos(phi));
  parametricMovement.y = ((R + r * Math.cos(theta)) * Math.sin(phi));
  parametricMovement.z = r * Math.sin(theta); 


  if (plane) {
    // Tangents and normals
    const dTheta = new THREE.Vector3(
      -Math.cos(phi) * Math.sin(theta),
      -Math.sin(theta) * Math.sin(phi),
      Math.cos(theta)
    ).normalize();

    const dPhi = new THREE.Vector3(
      -Math.sin(phi),
      Math.cos(phi),
      0.0
    ).normalize();

    // Normal vector as cross product of tangents
    const newNormal = new THREE.Vector3().crossVectors(dPhi, dTheta).normalize();

    const rotationMatrix = new THREE.Matrix4();
    const tangent1 = dTheta;
    const tangent2 = new THREE.Vector3().crossVectors(newNormal, dTheta).normalize();
   rotationMatrix.makeBasis(tangent1, newNormal, tangent2);

   // Apply the rotation matrix to the plane's position
   plane.position.copy(parametricMovement);
    planePos.value = plane.position;

   // Extract rotation from the rotation matrix and apply it to the plane's rotation
   const euler = new THREE.Euler();
   euler.setFromRotationMatrix(rotationMatrix);
   plane.rotation.copy(euler);

   sphereLight.position.set(planePos.value.x, planePos.value.y, planePos.value.z);
}
}


let speed = 0.1;
const clock = new THREE.Clock();  // Create a clock

// Setup update callback
function update() {
  planeMovement();

  time.value += .005;
  spottime.value += 0.005;
  
  const delta = clock.getDelta(); // Use a clock to get time between frames
  if (mixer) {
    mixer.update(delta); // Update the animation mixer
  }

  torusMaterial.needsUpdate = true;
  dashMaterial.needsUpdate = true;

  updateTitle();


  // Requests the next update call, this creates a loop
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
