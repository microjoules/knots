/*
 * UBC CPSC 314, Vjan2024t66
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

const size = 8; // Number of gradient steps
const colors = new Uint8Array(size);

let p = 3.0;
let q = 2.0;

let mixer; 
let plane;



//load plane
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('obj/plane.gltf', function (gltf) {
  plane = gltf.scene;
  plane.scale.set(0.3, 0.3, 0.3);
  plane.parent = worldFrame;
  scene.add(plane);

  // Setup and play animation
  mixer = new THREE.AnimationMixer(plane);
  const action = mixer.clipAction(gltf.animations[0]); 
  action.play();
});



//TORUS
// Define colors in the array (green to blue gradient)
colors[0] = 0;    // fully green
colors[1] = 64;   
colors[2] = 128;  // equal green and blue
colors[3] = 192;  
colors[4] = 255;  // fully blue 

// Create a DataTexture using the colors array
const gradientMap = new THREE.DataTexture(colors, size, 1, THREE.LuminanceFormat);

mat = new THREE.MeshToonMaterial({
  color: 0x44aa88,   // Base color of the material
  gradientMap: gradientMap  // Default toon shading; can use a custom gradient map
});

const torusGeometry = new THREE.TorusGeometry(20,5,50,100);
const torus = new THREE.Mesh(torusGeometry, mat);
torus.parent = worldFrame;
scene.add(torus);




// LIGHTING
// PointLight( color , intensity, distance , decay )
const sphereLight = new THREE.PointLight('0xff0000', 1, 80);
scene.add(sphereLight);

const light = new THREE.HemisphereLight( 'lightgreen', 'lightblue', 0.3 ); 
light.position.set(0.0, 0.0, 50.0);
scene.add(light);


// DASHED LINE PATH 
const dashMaterial = new THREE.LineDashedMaterial({
  color: 'black',    
  dashSize: 0.5,        
  gapSize: 1.0,       
  linewidth: 1,    
  scale: 1.0,
});

const maxPoints = 1000; // Max points for the path
let pathLine, pathGeometry;

function updatePath() {
  // Remove the previous pathLine from the scene if it exists
  if (pathLine) {
    scene.remove(pathLine);
  }

  const points = [];
  // Generate new points for the parametric path
  for (let i = 0; i < maxPoints; i++) {
    const t = i / (maxPoints - 1) * Math.PI * 2; 
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

  // update geometry with new points
  pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
  pathLine = new THREE.Line(pathGeometry, dashMaterial);
  pathLine.computeLineDistances();
  scene.add(pathLine);
}

// Initial path creation
updatePath();



// GUI
const gui = new dat.GUI();
const controls = {
  p: p,
  q: q
};
function updateTitle() {
  const titleElement = document.querySelector('.sub-title');
  titleElement.innerHTML = ` (${p}, ${q})-torus knot`;
}

//draw knot projection
function draw2DProjection(p, q) {
  const canvas = document.getElementById('knotCanvas');
  const ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const points = [];
  const maxPoints = 500; 
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

const step = 1.0;
gui.add(controls, 'p', 0, 10, step).name('p').onChange(function(value) {
  p = value;
  updatePath();
  updateTitle();
  draw2DProjection(p, q);
  planeMovement();
});

gui.add(controls, 'q', 0, 10, step).name('q').onChange(function(value) {
  // Update phi in your scene if needed
  // You might want to adjust this according to your needs
  q = value;
  updatePath();
  updateTitle();
  draw2DProjection(p, q);
  planeMovement();
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
    plane.position.copy(parametricMovement);
    const origin = plane.position.copy(parametricMovement);
    planePos.value = plane.position;
    sphereLight.position.set(planePos.value.x, planePos.value.y, planePos.value.z);
    

    // Compute tangent vector
    const delta = 0.001;
    const nextTheta = theta + delta;
    const nextPhi = phi + delta;

// Position with slight change in theta (for tangent in theta direction)
const thetaPosition = new THREE.Vector3(
    (R + r * Math.cos(nextTheta)) * Math.cos(phi),
    (R + r * Math.cos(nextTheta)) * Math.sin(phi),
    r * Math.sin(nextTheta)
);

// Position with slight change in phi (for tangent in phi direction)
const phiPosition = new THREE.Vector3(
    (R + r * Math.cos(theta)) * Math.cos(nextPhi),
    (R + r * Math.cos(theta)) * Math.sin(nextPhi),
    r * Math.sin(theta)
);

// Compute tangents for theta and phi directions
const thetaTangent = new THREE.Vector3().subVectors(thetaPosition, parametricMovement).normalize();
const phiTangent = new THREE.Vector3().subVectors(phiPosition, parametricMovement).normalize();

// Blend the tangents based on the relative sizes of p and q
const total = Math.abs(p) + Math.abs(q);  // Total weight
const blendFactorP = Math.abs(p) / total;
const blendFactorQ = Math.abs(q) / total;

const tangent = new THREE.Vector3()
    .addScaledVector(thetaTangent, blendFactorP)
    .addScaledVector(phiTangent, blendFactorQ)
    .normalize();
  
    // Tangents and normals
    const dTheta = new THREE.Vector3(
      -(r * Math.sin(theta)) * Math.cos(phi),
      -(r * Math.sin(theta)) * Math.sin(phi),
      r * Math.cos(theta)
    ).normalize();

    const dPhi = new THREE.Vector3(
      -(R + r * Math.cos(theta)) * Math.sin(phi),
      (R + r * Math.cos(theta)) * Math.cos(phi),
      0.0
    ).normalize();

    // Normal vector as cross product of tangents
    const up = new THREE.Vector3().crossVectors(thetaTangent, phiTangent).normalize();
    //const up = new THREE.Vector3(0, 1, 0);  
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize(); //side
  
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeBasis(up, side, tangent.multiplyScalar(-1.0));
    plane.rotation.setFromRotationMatrix(rotationMatrix);

    function addArrow(start, dir, length, color) {
      const arrowHelper = new THREE.ArrowHelper(dir.normalize(), start, length, color);
      scene.add(arrowHelper);
    }
    
    addArrow(origin, up.multiplyScalar(-1.0), 5, 0xff0000);   // Red for tangent
    //addArrow(plane.position.copy(parametricMovement), tangent.multiplyScalar(-1.0), 5, 0x00ff00);    // Green for normal
    //addArrow(plane.position.copy(parametricMovement), side, 5, 0x0000ff); 
  }

}


let speed = 0.1;
const clock = new THREE.Clock();  // Create a clock

// Setup update callback
function update() {
  
  time.value += 0.01; // Increment time
  if (mixer) mixer.update(0.01);

  planeMovement();

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
