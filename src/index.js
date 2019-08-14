import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// declare variables
var scene, camera, renderer, loader, model, container, controls;
var view_size = {width: window.innerWidth, height: window.innerHeight};

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function loadHouseModel(model_path){
    let model_file_extension = model_path.split('.').pop();
    switch (model_file_extension) {
        case 'gltf':
            loader = new GLTFLoader();
            break;
        case 'dae':
            loader = new ColladaLoader();
            break;
        default:
            break;
    }
    loadModel(model_path, loader);
}

function loadModel(model_path, loader){
    loader.load(
        model_path,
        model_type => {
            model = model_type.scene;

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

            // add model to scene
            model.updateMatrix();
            model.position.set(0, 0, 0);
            scene.add(model);
        },
        xhr => {
            // handle load progress here
        },
        error => console.log("loadModel() error", error)
    );
}

function addLight(scene){
    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, .4, 0 );
    lights[ 0 ].position.set( 0, 200, 0 );
    scene.add(lights[ 0 ]);

    var ambientLight = new THREE.AmbientLight( 0x916262 );
    scene.add( ambientLight );

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );
}


function addCube(x, y,z){
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x, y, z);
    scene.add( cube );
}

function mouseMove(event){
    let scale = 1;
    mouse.x = - ( event.clientX / renderer.domElement.clientWidth ) * 2 + 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    camera.rotation.x = mouse.y / scale;
    camera.rotation.y = mouse.x / scale;
}

function init(){
    // get container
    container = document.getElementById("3d-decor");
    view_size.width = window.getComputedStyle(container).width.slice(0, -2);
    view_size.height = window.getComputedStyle(container).height.slice(0, -2);

    // setup basic scene/camera/renderer camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd6e6ff);
    camera = new THREE.PerspectiveCamera(50, view_size.width / view_size.height, 0.01, 100);
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    // recommended configs by Three.js when loading glTF model
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    var houseModel = "/apartment/scene.gltf";
    // var houseModel = "/apartment2/apartment.dae";
    // var houseModel = "/apartment_floorplan/scene.gltf";
    loadHouseModel(houseModel);
    addLight(scene);

    // render
    container.appendChild(renderer.domElement);
    // controls = new OrbitControls( camera, renderer.domElement );
    controls = new PointerLockControls(camera);
    controls.enabled = true;
    scene.add(controls.getObject());
    camera.position.set(0, 0.2, -0.2);

    camera.rotation.order = "YXZ"; // this is not the default
    document.addEventListener( "mousemove", mouseMove, false );

    // when the mouse moves, call the given function
    // document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    // Execute Render
    renderer.setAnimationLoop(() => {
        if (model) {
            // model.rotation.y += 0.02;
        }
        renderer.render(scene, camera);
    });
}

init();




// function onDocumentMouseDown(event) {
//     // the following line would stop any other event handler from firing
//     // (such as the mouse's TrackballControls)
//     // event.preventDefault();

//     // update the mouse variable
//     mouse.x = ( event.clientX / view_size.width ) * 2 - 1;
//     mouse.y = - ( event.clientY / view_size.height ) * 2 + 1;

//     raycaster.setFromCamera( mouse, camera );
//     console.log(scene.children);
//     var intersects = raycaster.intersectObjects( scene.children );
//     if(intersects.length){
//         console.log(intersects);
//         // camera.position.set(intersects[0].point.x, 0.1, intersects[0].point.z)
//         // console.log("camera's potions");
//         // console.log(camera.position);
//         // camera.updateProjectionMatrix();
//     }
// }
