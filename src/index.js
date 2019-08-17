import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// declare variables
var scene, camera, renderer, loader, model, container, controls;
var view_size = {width: window.innerWidth, height: window.innerHeight};

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersects = {}, floor_point, lookAt_point, is_move = false;
var plane, sphere;


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

function contextMenu(event) {
    event.preventDefault();
}

function onMouseDown(event) {
    if(intersects.length > 0){
        var break_flag = false;
        intersects.forEach(function(intersect){
            if(intersect.object.uuid === plane.uuid){
                floor_point = intersect.point;
                is_move = true;
            }
            if(intersect.object.uuid === sphere.uuid){
                lookAt_point = intersect.point;
            }
        });
        if(is_move){
            camera.position.set(floor_point.x, 0.2, floor_point.z);
            camera.updateMatrix();
            controls.coupleCenters = false;
            is_move = false;
        }
    }
}

function mouseMove(event){
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onMouseUp(event){
}

function registerEvent(){
    document.addEventListener( "contextmenu", contextMenu, false );
    document.addEventListener( "mousedown", onMouseDown, false );
    document.addEventListener( "mousemove", mouseMove, false );
    document.addEventListener( "mouseup", onMouseUp, false );
}

function init(){
    // get container
    container = document.getElementById("container");
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
    loadHouseModel(houseModel);
    addLight(scene);

    // render
    container.appendChild(renderer.domElement);
    // Orbitcontrol
    controls = new OrbitControls( camera, renderer.domElement );
    controls.coupleCenters = true;

    camera.position.set(0, 0.2, -0.1);

    // For lookAt calculation
    var geometry = new THREE.SphereGeometry( 1.5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    // For move on floor
    var geometry = new THREE.PlaneGeometry( 1, 1, 32 );
    var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    plane.updateMatrix();
    scene.add( plane );

    var raycaster = new THREE.Raycaster();

    // Register event
    registerEvent();

    // Execute Render
    renderer.setAnimationLoop(() => {
        if (model) {
            // model.rotation.y += 0.02;
        }
        raycaster.setFromCamera( mouse, camera );
        intersects = raycaster.intersectObjects( scene.children );

        // console.log(intersects);
        renderer.render(scene, camera);
    });
}

init();





