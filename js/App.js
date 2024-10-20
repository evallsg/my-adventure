import * as THREE from 'three';

import { Resources } from './Resources.js';
import {World} from './World.js';
import Controls from './CameraControls.js';
import Stats from 'three/addons/libs/stats.module.js';

class App {
    constructor() {
        // this.gui = new dat.GUI();

        this.hintVisible = true;

        this.clock = new THREE.Clock();
        this.elapsedTime = 0;

        this.scene = null;
        this.river = null;
        this.resources = new Resources((values) => {
            this.loadedItems = values;
            this.init();
        });

        this.info = {
            "BIRTHPLACE": {
                text: "My adventure started in Arbúcies, a little village in the middle of the mountains",
                position: 0.99,
                content : {
                    image: "/data/arbucies.jpg"
                }
            },
            "STUDIES": {
                text: "I moved to Barcelona for study Audiovisual Systems Engineering and Computer Science at Universitat Pompeu Fabra",
                position: 0.80,
                content : {
                    image: "/data/upf.jpg"
                }
            },
            "INTERNSHIP": {
                text: "While I was studing, I did an internship in Liquid Sutdios, where I learned how to develop web applications",
                position: 0.61,
                content: {
                    text: "Go to Liquid",
                    link: "https://www.liquidbcn.com/en/"
                }
            },
            "DEGREE_PROJECT": {
                text: "Later, I joined the Interactive Technologies Research Group at the university, where I did my final degree thesis",
                content: {
                    link: "https://webglstudio.org/papers/ICGI2019/",
                    text: "3D puppeteering on the web",
                    image: "/data/tfg.png"
                },
                position: 0.50 
            },
            "TODAY": {
                text: "I currently work as a support researcher in the same group, specializing in computer animation for embodied virtual characters.",
                
                position: 0.40 
            }

        }
        this.popupActive = false;
    }
    
    init() {        
        this.scene = new THREE.Scene();
        let sceneColor = 0xbfe3dd;//0x303030;
        this.scene.background = null// new THREE.Color( sceneColor );
        //this.scene.fog = new THREE.Fog( 0xF4F2DE, 10, 100 );

        this.setCamera();
        
        const options = {
            renderer: this.renderer,
            camera: this.camera,
            controls: this.controls,
            scene: this.scene,
            resources: this.loadedItems,
        }
        
        this.setLights();
        this.world = new World(options);
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor( 0xffffff, 0);
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        // this.renderer.toneMapping = THREE.AgXToneMapping;
        // this.renderer.toneMappingExposure = 1;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild( this.renderer.domElement );
        this.stats = new Stats();
        // document.body.appendChild( this.stats.dom );
        this.drag = this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.animate();  
        
        document.getElementById("loading").style.display = "none";    
        document.getElementById("drag-hint").classList.remove('hidden');    
       
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );
        window.addEventListener( 'keydown', this.onKeyDown.bind(this) );
        window.addEventListener( 'mousedown', this.onMouse.bind(this) );
        window.addEventListener( 'mousemove', this.onMouse.bind(this) );
        window.addEventListener( 'mouseup', this.onMouse.bind(this) );
        window.addEventListener( 'mousewheel', this.onMouse.bind(this), {passive: false} );
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

        
        let shadowMapSize = 16;
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(0, 12, 0);
        sunLight.visible = true;
        sunLight.castShadow = true;
        sunLight.shadow.intensity = 0.1;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 1; 
        sunLight.shadow.camera.far = shadowMapSize;
        sunLight.shadow.camera.top = shadowMapSize;
        sunLight.shadow.camera.bottom = -shadowMapSize;
        sunLight.shadow.camera.left = -shadowMapSize;
        sunLight.shadow.camera.right = shadowMapSize;
        sunLight.shadow.normalBias = 0.1;
        sunLight.shadow.radius = 5;
        sunLight.shadow.blurSamples = 5;
        this.scene.add(sunLight);
        this.scene.add( sunLight.target );
        
        const ambientLight = new THREE.AmbientLight( "#FFFBF1", 1 );
        this.scene.add( ambientLight );

        // const helper = new THREE.CameraHelper( sunLight.shadow.camera );
        // this.scene.add( helper );

       
        const params = {
            color:"#ff0000",
            intensity: 1.2,
            x: 1.2,
            y: 2,
            z: 1,
            intensityS: 1
        }
        // const folderLights = this.gui.addFolder( 'Directional Light' );
        // folderLights.add( params, 'color').onChange( (v) => sunLight.color.set(params.color) );   
        // folderLights.add( params, 'intensity').onChange( (v) => sunLight.intensity = v );   
        // folderLights.add( params, 'x').onChange( (v) => sunLight.position.x = v );   
        // folderLights.add( params, 'y').onChange( (v) => sunLight.position.y = v );   
        // folderLights.add( params, 'z').onChange( (v) => sunLight.position.z = v );   
        // folderLights.add( params, 'intensityS').onChange( (v) => sunLight.shadow.intensity = v );   
        // folderLights.open();

        // const directionalLight = new THREE.DirectionalLight( 0xffffff, params.intensity );
        // directionalLight.position.x = params.x;
        // directionalLight.position.y = params.y;
        // directionalLight.position.z = params.z;
        // this.scene.add( directionalLight );
    }
    /**
     * Set camera
     */
    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set( -0.6894549264597977, 1.8, 16 );
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.scene.add(this.camera);
        this.controls = new Controls(this.camera, {zoom: 4.5});
    }

    /**
     * 
     * Set popups
     */
    setPopup(type) {
        if( this.popupActive || this.controls.zoomValue > 10) {
            return;
        } 
        else {
            this.popupActive = true
        }
        const info = this.info[type];
        const element = document.getElementById("popup");
        element.classList.add("animation-in");
        element.classList.remove("animation-out");
        const text = document.getElementById("popup-text");
        text.innerText = info.text;
        const button = document.getElementById("popup-button");
        const image = document.getElementById("popup-image");
        button.classList.add("hidden");
        image.parentElement.classList.add("hidden");


        if(info.content) {
            if(info.content.image) {
                image.parentElement.classList.remove("hidden");
                image.src = info.content.image;
            }
            if(info.content.link) {
                button.innerText = info.content.text;
                button.classList.remove("hidden")
                button.onclick = () => {

                    window.open(info.content.link);
                } 
            }
        }
        else {
            if(!button.classList.contains("hidden")){
            button.classList.add("hidden");
            }
            if(!image.parentElement.classList.contains("hidden")) {
                image.parentElement.classList.add("hidden");
            }
        }
    }

    removePopup() {
        this.popupActive = false;
        const element = document.getElementById("popup");
        element.classList.remove("animation-in");
        element.classList.add("animation-out");
    }

    onKeyDown(e) {
        // switch(e.key) {
        //     case "A": case "a":
        //         this.world.woman.moveLeft(0.1);
        //         break;
        //     case "D": case "d":
        //         this.world.woman.moveRight(0.1);
        //         break;
        //     case "W": case "w":
        //         this.world.woman.moveForwards(0.1);
        //         break;
        //     case "S": case "s":
        //         this.world.woman.moveBackwards(0.1);
        //         break;
        //     // case "Z": case "z":
        //     //     this.world.woman.position.y +=0.1;
        //     //     this.world.physics.woman.body.position.y += 0.1;
        //     //     break;
        //     // case "X": case "x":
        //     //     this.world.woman.position.y -=0.1;
        //     //     this.world.physics.woman.body.position.y -= 0.1;
        //     //     break;
        //     // case " ":
        //     //     this.world.physics.woman.jump(true, 0.1);
        //     //     // this.world.woman.position.y +=1;
        //     //     // this.world.physics.woman.body.position.y += 1;
        //     //     break;
        //     // case "Escape":
        //     //     this.world.physics.woman.body.position.set(5,1.5,12);
        //     //     this.world.physics.woman.body.quaternion.set(0,0,0,1)
        //     //     break;
        // }
    }

    onMouse(e) {
        e.preventDefault();
        e.stopPropagation();

        if(e.type == 'mousedown') {
            document.body.className = 'grabbing-cursor';
            this.grab = true;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY; 
            this.world.startCharacterMovement();
            if(this.hintVisible) {
                document.getElementById("drag-hint").classList.add('hidden');    
                this.hintVisible = false;
            }
        }
        else if( e.type == 'mousemove' && this.grab) {
            let offset = (this.offsetX - e.offsetX)/window.innerWidth;

            if(Math.abs(offset) < 0.0001) {
                // return;
                offset = 0;
            }
            
            this.grabbing = true;
            const offsetY = (this.offsetY - e.offsetY)/window.innerHeight*0.5;
            const pos = this.world.onMoveCharacter(offset, offsetY);
            if(!pos) {
                return;
            }
            this.offsetX = e.offsetX        
            for(let data in this.info) {
                const kpos = this.info[data].position;
                if(pos <= (kpos + 0.01) && pos >= (kpos - 0.01)) {
                    this.setPopup(data);
                    return;
                }
            }
          
            this.removePopup();  
        }
        else if(e.type == 'mouseup') {
            document.body.className = 'grab-cursor';
            this.grabbing = this.grab = false;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;  
            this.world.endCharacterMovement();
        }
        else if(e.type == 'mousewheel') {
         
            this.controls.zoom(e.wheelDelta);
            if(this.controls.zoomValue > 10) {
                this.removePopup();
            }
        }
    }
    animate() {

        this.grabbing = false;
        
        let delta = this.clock.getDelta()         
        this.elapsedTime += delta;
        
        this.renderer.render( this.scene, this.camera );
        this.update(delta); 
        
        requestAnimationFrame( this.animate.bind(this) );
    }

    update( deltaTime ) {
        this.elapsedTime += deltaTime;      
        this.world.update(this.elapsedTime, deltaTime, this.grabbing); 
        this.stats.update();
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