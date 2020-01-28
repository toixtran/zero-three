import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

let canvas = document.getElementById("myCanvas");
let camera, scene, renderer, controls, clock, loader, model;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersects = {}, floor_point, lookAt_point, is_move = false;
var plane, sphere;


function init() {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xd0d0d0 );
    
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0.3 , 0.3 , 0.3 );
    camera.lookAt( new THREE.Vector3( 0.3 , 0.1 , 0.3 ) );

    clock = new THREE.Clock();

    window.addEventListener("resize", function(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }, false);

    initControls();
    initLights();
    createScene();
}

// Scene
let createScene = function(){
    let houseModel = "/apartment/scene.gltf";
    // let houseModel = "/apartment2/apartment.dae";
    loadHouseModel(houseModel);

    // Floor
    var geometry = new THREE.PlaneGeometry( 1, 1, 32 );
    var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    plane.updateMatrix();
    scene.add( plane );
}

function loadHouseModel(model_path){
    let model_file_extension = model_path.split('.').pop();
    switch (model_file_extension){
        case 'gltf': loader = new GLTFLoader(); break;
        case 'dae': loader = new ColladaLoader(); break;
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
            model.scale.multiplyScalar(3.0 / maxAxis);
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

// Controll
let initControls = function(){
    camera.rotation.order = "YXZ";
    renderer.domElement.addEventListener('mousedown', downClick);
    renderer.domElement.addEventListener('mouseup', upClick);
}

function downClick(e) {
  renderer.domElement.addEventListener('mousemove', moveClick);
}
function upClick(e) {
  renderer.domElement.removeEventListener('mousemove', moveClick);
}

function moveClick(e){
    const movementY = (-e.movementY * Math.PI * 1) / 180;
    const movementX = (-e.movementX * Math.PI * 1) / 180;

    camera.rotation.x +=movementY;
    camera.rotation.y += movementX;
    renderer.render(scene, camera);

    // let mouse = scope.mouse;
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


// Light
let initLights = function(){
    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, .4, 0 );
    lights[ 0 ].position.set( 0, 200, 0 );
    scene.add(lights[ 0 ]);

    var ambientLight = new THREE.AmbientLight( 0x916262 );
    scene.add( ambientLight );

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );
}

function animate( time ) {
    let delta = clock.getDelta();
    
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

init();
requestAnimationFrame( animate );

