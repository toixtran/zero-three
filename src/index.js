import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Projector } from "three/examples/jsm/renderers/Projector";

// declare variables
var scene, camera, renderer, loader, model, container, controls;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function loadHouseModel(model_path) {
    let model_file_extension = model_path.split('.').pop();
    switch (model_file_extension) {
        case 'gltf':
            loadGLTFModel(model_path);
            break;
        default:
            break;
    }
}

function loadGLTFModel(model_path) {
    // Load gltf model
    loader = new GLTFLoader();
    loader.load(
        model_path,
        gltf => {
            model = gltf.scene;

            // setup center values
            let bbox = new THREE.Box3().setFromObject(model);
            let cent = bbox.getCenter(new THREE.Vector3());
            let size = bbox.getSize(new THREE.Vector3());
            let maxAxis = Math.max(size.x, size.y, size.z);

            // scale model
            model.scale.multiplyScalar(1.0 / maxAxis);
            bbox.setFromObject(model);
            bbox.getCenter(cent);
            bbox.getSize(size);

            // center model
            model.position.x -= cent.x;
            model.position.y -= cent.y;
            model.position.z -= cent.z;

            // add model to scene
            scene.add(model);
        },
        xhr => {
            // handle load progress here
        },
        error => console.log("glTF.load() error", error)
    );
}

function addLight(scene) {
    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, .4, 0 );
    lights[ 0 ].position.set( 0, 200, 0 );
    scene.add(lights[ 0 ]);

    var ambientLight = new THREE.AmbientLight( 0x916262 );
    scene.add( ambientLight );

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );
}

function onDocumentMouseDown(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    if(intersects.length){
        console.log(intersects[0]);
        camera.position.set(intersects[0].point.x, 0.1, intersects[0].point.z)
        console.log("camera's potions");
        console.log(camera.position);
        camera.updateProjectionMatrix();
    }
}

function addCube(x, y,z){
    var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x, y, z);
    scene.add( cube );
}

function init(){
    // get container
    container = document.getElementById("3d-decor");

    // setup basic scene/camera/renderer camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd6e6ff);
    camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    // recommended configs by Three.js when loading glTF model
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    var houseModel = "/apartment/scene.gltf";
    loadHouseModel(houseModel);
    addLight(scene);

    // addCube(0,0,0);
    addCube(0,0,-0.4);

    // render
    container.appendChild(renderer.domElement);
    controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set(0, 0.1, 0);

    // when the mouse moves, call the given function
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    console.log(camera.position);
    renderer.setAnimationLoop(() => {
        if (model) {
            // model.rotation.y += 0.02;
        }
        controls.update();
        renderer.render(scene, camera);
    });
}

init();


