import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

const PERSON_HEIGHT = 0.2;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

let canvas = document.getElementById("myCanvas");
let camera, scene, renderer, controls;
function init() {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xd0d0d0 );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0, PERSON_HEIGHT, 0);
    camera.lookAt( new THREE.Vector3( 0.3 , 0.1 , 0.3 ) );

    window.addEventListener("resize", function(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }, false);

    initControls();
    initLights();
    createScene();
}

let loader, model;
var plane, sphere;
// Scene
let createScene = function(){
    let houseModel = "/apartment/scene.gltf";
    // let houseModel = "/apartment2/apartment.dae";
    loadHouseModel(houseModel);

    // Floor
    var geometry = new THREE.PlaneGeometry( 1, 1, 1 );
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

// Controll
let initControls = function(){
    camera.rotation.order = "YXZ";
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
}

var intersects = {}, floor_point, lookAt_point, is_move = false;
function onMouseDown(e) {
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    console.log(intersects);
    if(intersects.length > 0){
        intersects.forEach(function(intersect){
            if(intersect.object.uuid === plane.uuid){
                floor_point = intersect.point;
                is_move = true;
            }
        });
    }
}
function onMouseUp(e) {
    renderer.domElement.removeEventListener('mousemove', onMouseMove);
    // If just click to floor Then move
    if(is_move){
        camera.position.set(floor_point.x, PERSON_HEIGHT, floor_point.z);
        camera.updateMatrix();
        is_move = false;
    }
}

var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
var PI_2 = Math.PI / 2;
function onMouseMove(e){
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    euler.setFromQuaternion( camera.quaternion );

    euler.y -= movementX * 0.004;
    euler.x -= movementY * 0.004;

    euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

    camera.quaternion.setFromEuler( euler );

    // reset is_move for detection mouse click or mouse pan
    is_move = false;
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
    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObjects( scene.children );

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

init();
requestAnimationFrame( animate );

