// alert("hello world");
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const modalContent = {
    Monitor: {
        title: "Dashboard",
        content: "This is a monitor.",
        link:"https://app.arduino.cc/dashboards/0e94a058-54ba-44d2-9a9b-afba19e24e85",
    },
    Plate01: {
        title: "LinkedIn",
        content: "Bio.",
        link:"https://www.youtube.com",
    },
    Plate02: {
        title: "About",
        content: "Digital Twin Information.",
        link:"https://www.youtube.com",
    },
};

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-visit-button");

function showModal(id){
    const content = modalContent[id];
    if (content) {
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;

        if (content.link) {
            modalVisitButton.href = content.link;
            modalVisitButton.classList.remove("hidden");
        }else {
            modalVisitButton.classList.add("hidden");
        }


        modal.classList.toggle("hidden");
    }
}

function hideModal(){
    modal.classList.toggle("hidden");
}



let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [
    "CCTV",
    "FCU",
    // "Clock",
    "Monitor",
    // "PlantLight",
    "Plate01",
    "Plate02",
    // "Thermometer",
    "Plant1",
    "Plant2",
];

const loader = new GLTFLoader();

loader.load( './FarmLab_Model02.glb', function ( glb ) {
  glb.scene.traverse((child) => {
    if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
    }
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // child.material.metalness = 0.2;
    }
    // console.log(child);
  });
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true;
sun.position.set( 40, 40, 0 );
sun.target.position.set( 0, 0, 0 );
sun.shadow.mapSize.width = 4096; // default
sun.shadow.mapSize.height = 4096; // default
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.normalBias = 0.2;
scene.add( sun );

const light = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
scene.add( light );

const aspect = sizes.width / sizes.height;

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(13.3, 4.4, 12.8);
camera.lookAt(0, 3, 0);

const controls = new OrbitControls( camera, canvas );
controls.target.set(0, 3, 0);
controls.update();


function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
}

function jumpPlants(meshID) {
    const mesh = scene.getObjectByName(meshID);
    if (!mesh) return;
  
    const jumpHeight = 2;
    const jumpDuration = 0.5;
  
    const startY = mesh.position.y; // <- SAVE the original Y
  
    const t1 = gsap.timeline();
  
    t1.to(mesh.scale, {
      x: 1,
      y: 0.8,
      z: 1.2,
      duration: jumpDuration * 0.3,
      ease: "power2.out",
    });
  
    t1.to(mesh.position, {
      y: startY + jumpHeight,
      duration: jumpDuration * 0.3,
      ease: "power2.out",
    }, "<");
  
    t1.to(mesh.position, {
      y: startY, // <- use the saved Y
      duration: jumpDuration * 0.5,
      ease: "bounce.out",
    });
  
    t1.to(mesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: jumpDuration * 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  }

  function onClick() {
    if(intersectObject !== ""){
      if(["Plant1","Plant2","CCTV","FCU"].includes(intersectObject)){
        jumpPlants(intersectObject);
      } else {
        showModal(intersectObject);
      }
    }
  }

// function onClick( event ) {
//     if (intersectObject !=="") {
//         showModal(intersectObject);
//     }
// }

function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener( "pointermove", onPointerMove );


function animate() {
  controls.enablePan = false;

  controls.maxDistance = 25; // or whatever feels right
  controls.minDistance = 10;


  // Vertical limits (up/down)
  controls.minPolarAngle = THREE.MathUtils.degToRad(35); // 45° down
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90); // 135° = 45° up

  // Horizontal limits (left/right)
  controls.minAzimuthAngle = THREE.MathUtils.degToRad(5); // 45° left
  controls.maxAzimuthAngle = THREE.MathUtils.degToRad(85);  // 45° right


  raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(intersectObjects);

    if ( intersects.length > 0 ) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
        intersectObject = "";
    }

	for ( let i = 0; i < intersects.length; i ++ ) {
        intersectObject = intersects[0].object.parent.name;
	}

    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );