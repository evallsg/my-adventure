import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Resources } from './Resources.js';
import World from './World.js';

class App {
    constructor() {

        this.clock = new THREE.Clock();
        this.elapsedTime = 0;

        this.scene = null;
        this.river = null;
        this.resources = new Resources((values) => {
            this.loadedItems = values;
            this.init();
        });
    }
    
    init() {        
        this.scene = new THREE.Scene();
        let sceneColor = 0xbfe3dd;//0x303030;
        this.scene.background = null// new THREE.Color( sceneColor );
        this.scene.fog = new THREE.Fog( 0xF4F2DE, 10, 100 );

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor( 0xffffff, 0);

        this.renderer.toneMapping = THREE.AgXToneMapping;
        this.renderer.toneMappingExposure = 1;
        // this.renderer.shadowMap.enabled = false;
        document.body.appendChild( this.renderer.domElement );

        this.setLights();
        this.setCamera();
        //this.controls.enablePan = this.controls.enableDamping = this.controls.enableRotate = false;
        const options = {
            renderer: this.renderer,
            camera: this.camera,
            //controls: this.controls,
            scene: this.scene,
            resources: this.loadedItems,
            //offset: this.controls.getAzimuthalAngle()
        }

        this.world = new World(options);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        //this.controls.target.copy(this.world.woman.model.position);
        //this.controls.minPolarAngle = this.controls.maxPolarAngle = this.controls.getPolarAngle();
        //this.controls.minAzimuthAngle = this.controls.maxAzimuthAngle = this.controls.getAzimuthalAngle();

        document.getElementById("loading").style.display = "none";    
        this.drag = this.dragging = false;
        this.offsetX = 0;
        this.animate();  
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );
        window.addEventListener( 'keydown', this.onKeyDown.bind(this) );
        window.addEventListener( 'mousedown', this.onMouse.bind(this) );
        window.addEventListener( 'mousemove', this.onMouse.bind(this) );
        window.addEventListener( 'mouseup', this.onMouse.bind(this) );
    }

    /**
     * Set lights
     */
    setLights()
    {
        // Lights
        const hemiLight = new THREE.HemisphereLight( 0xfff, 0xfff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        this.scene.add( hemiLight );

        let shadowMapSize = 13;
        const sunLight = new THREE.DirectionalLight(0xffffff, 1, 100);
        sunLight.position.set(0,12,12);
        sunLight.color.setHSL( 0.1, 1, 0.95 );
        sunLight.visible = true;
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5; 
        sunLight.shadow.camera.far = shadowMapSize*2;
        sunLight.shadow.camera.top = shadowMapSize;
        sunLight.shadow.camera.bottom = -shadowMapSize;
        sunLight.shadow.camera.left = -shadowMapSize;
        sunLight.shadow.camera.right = shadowMapSize;
        sunLight.shadow.normalBias = 0.02;
        this.scene.add(sunLight);
        this.scene.add( sunLight.target );

        // const helper = new THREE.CameraHelper( sunLight.shadow.camera );
        // this.scene.add( helper );

        const spotLight = new THREE.SpotLight(0xffffff, 4, 6, Math.PI/4, 1, 1);
        spotLight.position.set( 0, 3.5, 0 );
        spotLight.visible = false;
        spotLight.castShadow = false;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5; 
        spotLight.shadow.camera.far = 2;
        spotLight.shadow.normalBias = 0.02;
        this.scene.add( spotLight );
        this.scene.add( spotLight.target );

        const ambientLight = new THREE.AmbientLight( 0xe7e7e7, 1.2 );
        this.scene.add( ambientLight );

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
        directionalLight.position.set( - 1, 1, 1 );
        this.scene.add( directionalLight );
    }
    /**
     * Set camera
     */
    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set( -0.6894549264597977, 1.66, 16 );
		//this.camera.lookAt( this.scene.position );
        // this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        // this.controls.update();

        this.scene.add(this.camera)
    }

    onKeyDown(e) {
        switch(e.key) {
            case "A": case "a":
                this.world.woman.moveLeft(0.1);
                break;
            case "D": case "d":
                this.world.woman.moveRight(0.1);
                break;
            case "W": case "w":
                this.world.woman.moveForwards(0.1);
                break;
            case "S": case "s":
                this.world.woman.moveBackwards(0.1);
                break;
            // case "Z": case "z":
            //     this.world.woman.position.y +=0.1;
            //     this.world.physics.woman.body.position.y += 0.1;
            //     break;
            // case "X": case "x":
            //     this.world.woman.position.y -=0.1;
            //     this.world.physics.woman.body.position.y -= 0.1;
            //     break;
            // case " ":
            //     this.world.physics.woman.jump(true, 0.1);
            //     // this.world.woman.position.y +=1;
            //     // this.world.physics.woman.body.position.y += 1;
            //     break;
            // case "Escape":
            //     this.world.physics.woman.body.position.set(5,1.5,12);
            //     this.world.physics.woman.body.quaternion.set(0,0,0,1)
            //     break;
        }
    }

    onMouse(e) {
        if(e.type == 'mousedown') {
            this.grab = true;
            this.offsetX= e.offsetX;
            this.world.startCharacterMovement();
        }
        else if( e.type == 'mousemove' && this.grab) {
            this.grabbing = true;
            this.world.onMoveCharacter((this.offsetX - e.offsetX)/window.innerWidth*0.05);
        }
        else if(e.type == 'mouseup') {
            this.grabbing = this.grab = false;
            this.offsetX= e.offsetX;
            this.world.endCharacterMovement();
        }
    }
    animate() {

        this.grabbing = false;
        requestAnimationFrame( this.animate.bind(this) );

        let delta = this.clock.getDelta()         
        this.elapsedTime += delta;
        
        // this.controls.update();
        this.update(delta); 
       
        this.renderer.render( this.scene, this.camera );
    }

    update( deltaTime ) {
        this.elapsedTime += deltaTime;      
        this.world.update(this.elapsedTime, deltaTime, this.grabbing); 
    }

    onWindowResize( ) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    computeMovement(x, t) {
        const w = 1/(60 *(2*Math.PI)); //20rpm
        const F = 5;
        const r = 0.5;
        const m = 1;
        let xf =  new THREE.Vector2();
        xf.x = x.x + r*Math.cos(w*t*100)+ 0.1*Math.random();
        xf.y = x.y + r*Math.sin(w*t*100);
        return xf;
    }
}

export {App}


const app = new App();
window.app = app;