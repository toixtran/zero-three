// UNCOMMENT CAMERA CHANGED ROTATION IN function initControls() ON LINE 74
import * as THREE from "three";

let canvas = document.getElementById("myCanvas");
let camera0, scene0, renderer, controls, clock;
let sphere;
let Lights = [];
let shadows = true;


function init() {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    if(shadows){ 
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    scene0 = new THREE.Scene();
    scene0.background = new THREE.Color( 0xd0d0d0 );
    
    camera0 = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera0.position.set( 0 , 3 , 10 );
    camera0.lookAt( new THREE.Vector3( 0 , 0 , 0 ) );

    clock = new THREE.Clock();

    window.addEventListener("resize", function(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera0.aspect = window.innerWidth / window.innerHeight;
        camera0.updateProjectionMatrix();
    }, false);
    
    initControls();
    initLights();
    createStartingMesh();
}

let createStartingMesh = function(){
    let cube = new THREE.Mesh( 
        new THREE.BoxBufferGeometry(2, 2, 2) , 
        new THREE.MeshLambertMaterial({color: 0x404040 })
    );
    cube.position.set( 0 , 1 , 0 );
    if(shadows) {
        cube.castShadow = true;
        cube.receiveShadow = true;
    }
    scene0.add( cube );
  
    
    let floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 100 , 100 ),
        new THREE.MeshStandardMaterial({
            color: 0x209030,
            metalness: 0.0,
            roughness: 0.8,
        })
    );
    floor.rotateX( -90 * Math.PI/180 );
    if(shadows) {
        floor.receiveShadow = true;
    }
    scene0.add( floor );
    
    let size = 20;
    let divisions = 20;
    let gridHelper = new THREE.GridHelper( size, divisions );
    scene0.add( gridHelper );
    
}

let initControls = function(){

  camera0.rotation.order = "YXZ";

  canvas.addEventListener('mousemove', function(evt){
  
      let movementX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || 0;
      let movementY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || 0;
      
      camera0.rotation.x -= movementY / 200;
      camera0.rotation.y -= movementX / 200;
    }, false);
}

let initLights = function(){
    Lights[0] = new THREE.AmbientLight( 0xffffff , 0.3 );
    Lights[1] = new THREE.DirectionalLight( 0xffffff , 0.8 );
    Lights[1].position.set( 30 , 100 , 50 );
    if(shadows){
        let shadowResolution = 1;
        Lights[1].castShadow = true;
        Lights[1].shadow.mapSize.width = 1024 * shadowResolution;
        Lights[1].shadow.mapSize.height = 1024 * shadowResolution;
        Lights[1].shadow.camera.near = 0.1;
        Lights[1].shadow.camera.far = 1000;
        if( Lights[1] instanceof THREE.DirectionalLight ){
            Lights[1].shadow.camera.left = -100;
            Lights[1].shadow.camera.bottom = -100;
            Lights[1].shadow.camera.top = 100;
            Lights[1].shadow.camera.right = 100;
        }
        Lights[1].shadow.bias = 0.0001;
    }
    let helper = new THREE.CameraHelper( Lights[1].shadow.camera );
    scene0.add( helper );
    
    for(let i = 0; i < Lights.length; i++){
        scene0.add( Lights[i] );
    }
}

function animate( time ) {
    let delta = clock.getDelta();
    
    renderer.render( scene0, camera0 );
    requestAnimationFrame( animate );
}

init();
requestAnimationFrame( animate );

