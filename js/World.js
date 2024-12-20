import * as THREE from 'three';
import Character from './Character.js';

function createGradientShader(uniforms, shader) {
    shader.uniforms.gradTexture = uniforms.gradTexture;
    shader.uniforms.boxMin = uniforms.box.min;
    shader.uniforms.boxMax = uniforms.box.max;
    shader.vertexShader = `
      varying vec3 wPos;
      ${shader.vertexShader}
    `.replace(
      `#include <project_vertex>`,
      `
        wPos = vec3(modelMatrix * vec4(transformed, 1.));
      
      #include <project_vertex>
      `
    );
    shader.fragmentShader = `
      uniform sampler2D gradTexture;
      uniform vec3 boxMin;
      uniform vec3 boxMax;
      varying vec3 wPos;
      ${shader.fragmentShader}
      vec2 rotateUV(vec2 uv, float rotation)
      {
          float mid = 0.5;
          return vec2(
              cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
              cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
          );
      }
    `.replace(
      `#include <color_fragment>`,
      `#include <color_fragment>
      
        vec3 diag = boxMax - boxMin;
        float diagDist = length(diag);
        vec3 diagN = normalize(diag);
        
        vec3 boundPos = wPos - boxMin;
        
        float dotted = dot(diagN, boundPos);
        float dottedN = clamp(dotted / diagDist, 0., 1.);
        
        //dottedN = fract(dottedN * 10.);
        float mid = 0.6;
        float rotation = -3.14*0.5;
        vec2 uv = vec2(dottedN, 0.5);
        uv = vec2(
              cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
              cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
          );
        
        vec3 gradColor = texture(gradTexture, uv).rgb;
        
        diffuseColor.rgb = gradColor;
      
      `
    );

}

function createGradientShader2(uniforms, shader) {
  shader.uniforms.gradTexture = uniforms.gradTexture;
  shader.vertexShader = `
    varying vec3 wPos;
    ${shader.vertexShader}
  `.replace(
    `#include <project_vertex>`,
    `
      wPos = vec3(modelMatrix * vec4(transformed, 1.));
    
    #include <project_vertex>
    `
  );
  shader.fragmentShader = `
    uniform sampler2D gradTexture;
    uniform vec3 boxMin;
    uniform vec3 boxMax;
    varying vec3 wPos;
    ${shader.fragmentShader}
    vec2 rotateUV(vec2 uv, float rotation)
    {
        float mid = 0.5;
        return vec2(
            cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
            cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
        );
    }
  `.replace(
    `#include <color_fragment>`,
    `#include <color_fragment>
    
      vec3 diag = boxMax - boxMin;
      float diagDist = length(diag);
      vec3 diagN = normalize(diag);
      
      vec3 boundPos = wPos - boxMin;
      
      float dotted = dot(diagN, boundPos);
      float dottedN = clamp(dotted / diagDist, 0., 1.);
      
      //dottedN = fract(dottedN * 10.);
      float mid = 0.6;
      float rotation = -3.14*0.5;
      vec2 uv = vec2(dottedN, 0.5);
      uv = vec2(
            cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
            cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
        );
      
      vec3 gradColor = texture(gradTexture, uv).rgb;
      
      diffuseColor.rgb = gradColor;
    
    `
  );

}
class World {
    constructor(options) {

      this.scene = options.scene;
      this.renderer = options.renderer;
      this.controls = options.controls;
      this.resources = options.resources;
      this.elapsed = 1;
      this.pathPos = 0;
      this.setScene();
      this.origin = new THREE.Vector3();
    }

    setScene()
    {
      // this.resources.scene.scene.rotateY(-1.73)
      // let colors = ['#479ABC', '#7C9D96'];
      // let colors = ['#B02A37', '#C38791'];
      let colors = ['#6B5C46', '#D7E6E9'];
      let gradTexture = getGradientTexture(colors);
      let uniforms = {
        gradTexture: {value: gradTexture},
        box: {
          min: {value: new THREE.Vector3(-5, 0, -5)},
          max: {value: new THREE.Vector3(5, 8, 5)}
        }
      }
      this.scene.add(this.resources.scene.scene);

      this.resources.scene.scene.traverse((object)=> {
        if(object.name.includes("Mountain")) {
          for(let i = 0; i < object.children.length; i++) {
            if(object.children[i].isMesh){
                object.children[i].receiveShadow  = true;
                object.children[i].castShadow = false;
            }
          }
        }
        else if(!object.name.includes("Catwalk")&& !object.name.includes("Cloud")) {
          for(let i = 0; i < object.children.length; i++) {
            if(object.children[i].isMesh)
              object.children[i].castShadow = true;
              object.children[i].receiveShadow = true;
          }
        }
      })
      const mountain = this.scene.getObjectByName("Mountain");
      // mountain.children[0].material.onBeforeCompile = (shader) => createGradientShader(uniforms, shader);

      colors = ['#D1B58E', '#2F2E2F'];
      gradTexture = getGradientTexture(colors);
      uniforms.gradTexture= {value: gradTexture},
    //  mountain.children[1].material.onBeforeCompile = (shader) => createGradientShader(uniforms, shader);

      // this.scene.add(new THREE.Box3Helper(new THREE.Box3(u.box.min.value, u.box.max.value)));
      this.catwalk = this.scene.getObjectByName("Catwalk");
      this.catwalk.material.flatShading = true;
      // this.catwalk.material.color.set("#EAA354");
      this.boat = this.scene.getObjectByName("Lifeboat");

      const water = this.scene.getObjectByName("Water");
      const waterfall = this.scene.getObjectByName("Waterfall");
      water.material.color.set("#9FC3B8");
      waterfall.material = water.material;

      // Create woman
      const woman = this.resources.character.scene;
      this.scene.add(woman);
      
      woman.traverse((object)=> {    
        if(object.isMesh)
          object.castShadow = true;
          object.receiveShadow = true;
        }
      )
      this.woman = new Character({object: woman, animations: this.resources.character.animations, idle_name: "Idle_Neutral", size: 0.7});
      this.woman.activateAction(this.woman.WALK);

      // Create dog
      const dog = this.resources.dog.scene;
      this.scene.add(dog)
      dog.traverse((object)=> {    
        if(object.isMesh)
          object.castShadow = true;
          object.receiveShadow = true;
        }
      )
      this.dog = new Character({object: dog, animations: this.resources.dog.animations, run: "Gallop", size: 0.7});
      this.dog.activateAction(this.dog.WALK);
      this.scene.add(this.resources.curve_path.mesh)

      this.path = this.resources.curve_path.curve;
      this.path.closed = false;       
      // this.dog.scale.set(10,10,10)
      this.controls.center = this.catwalk.position;
      this.clouds = [];
      let angle = 0;
      for(let i = 0; i < this.resources.scene.scene.children.length; i++) {
        let child =  this.resources.scene.scene.children[i];
        if(child.name.includes("Cloud")) {
          child.castShadow = false;
          const cloud = new Cloud(child);
          angle+= 0.01;
          this.clouds.push(cloud)
        }
      }

      // Create Eagle
      this.eagle = new Bird(this.resources.eagle.scene, {position: new THREE.Vector3(5, 8, 5), radius: 10, speed: 0.05, animations: this.resources.eagle.animations})
      this.scene.add(this.resources.eagle.scene);

      // Create Eva (me)
      const eva = this.resources.eva.scene;
      this.scene.add(eva);
      this.eva = new Character({object: eva, position: new THREE.Vector3(-0.5, 6.45, -0.5), size: 0.4, animations: this.resources.eva_animations.animations, idle_name: "Standing Idle (3)"})

      // Create Deer
      const deer = this.resources.deer.scene;
      this.scene.add(deer);
      this.deer = new Character({object: deer, position: new THREE.Vector3(10.5, 0.1, 4), size: 0.2, animations: this.resources.deer.animations, idle_name: "Eating"})

      // Create Horse
      const horse = this.resources.horse.scene;
      horse.rotateY(Math.PI/2);
      this.scene.add(horse);
      this.horse = new Character({object: horse, position: new THREE.Vector3(-11, 0.01, 3), size: 0.2, animations: this.resources.horse.animations})
     
      // Create Fish
      const fish = this.resources.fish.scene;
      this.scene.add(fish);
      fish.rotateY(Math.PI);
      this.fish = new Fish(fish, {object: fish, position: new THREE.Vector3(1.1, -1.1, 8), size: 0.03, speed: 1.2, animations: this.resources.fish.animations, idle_name: "Fish_Armature|Swimming_Normal"})

      this.onMoveCharacter(0.0, 0, true);
    }

    update(et, dt, grabbing)
    {

      if(!grabbing) {
        this.woman.activateAction("Idle_Neutral", 0.4);
        this.dog.activateAction("Idle", 0.4);
      }
      this.woman.update(et, dt);
      this.dog.update(et, dt);
      this.eva.update(et, dt);
      const w = 2*Math.PI*0.5
      this.boat.rotateZ(0.0005*Math.sin(w*et))

      for(let i = 0; i < this.clouds.length; i++) {
        this.clouds[i].update(dt);
      }

      this.eagle.update(et,dt);
      this.deer.update(et,dt);
      this.horse.update(et,dt);
      this.fish.update(et,dt);
    }

    onMoveCharacter(amount, offsetY = 0, force = false) {
     
      if(!force && (this.elapsed + amount > 1 || this.elapsed + amount < 0.02 || amount == 0) ) {
        
        return;
      }
      this.elapsed +=amount;
      
      const position = this.path.getPointAt(this.elapsed);   
      const nextPosition = this.path.getPointAt(Math.min(1, Math.max(0.02,this.elapsed + amount)));
      
      this.woman.updatePosition(position, nextPosition, amount);
      this.dog.updatePosition(position, nextPosition, amount);
    
      this.controls.update(position, offsetY);
     
      return this.elapsed;
  }

    startCharacterMovement() {
      this.pathPos = this.elapsed;
    }

    endCharacterMovement() {
      this.pathPos = this.elapsed;
      this.woman.activateAction("Idle_Neutral")
    }
}

export { World }

function getGradientTexture(colors){
  let c = document.createElement("canvas");
  let ctx = c.getContext("2d");
  let grd = ctx.createLinearGradient(0, 0, c.width, 0);
  let clrStep = 1 / (colors.length - 1);
  colors.forEach((clr, clrIdx) => {
    grd.addColorStop(clrIdx * clrStep, clr)
  });
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, c.width, c.height);
  let ct = new THREE.CanvasTexture(c);
  ct.colorSpace = THREE.SRGBColorSpace
  c.remove();
  return ct;
}

class Cloud {
  constructor(model, options = {}) {
    this.model = model;
    this.position = options.position || model.position;
    this.speed = options.speed ||(Math.random() * 0.0001);
    this.radius = options.radius ||  (Math.ceil(Math.random() * 10 + 2) * (Math.round(Math.random()) ? 1 : -1) );
    this.angle = options.angle || Math.ceil(Math.random() * 10) * (Math.round(Math.random()) ? 1 : -1);
  }

  update(dt) {
    const centerX = 0
    const centerY = 0
  
    // const x = centerX + this.radius * Math.cos(this.angle);
    // const z = centerY + this.radius * Math.sin(this.angle);
  
    this.model.position.x += Math.sin(this.angle*this.speed)*this.speed;
    this.model.position.z += Math.sin(this.angle*this.speed);
    this.angle += this.speed;
  }
}

class Bird {
  constructor(model, options = {}) {
    this.model = model;
    this.position = options.position || model.position;
    this.model.position.copy(this.position);
    this.speed = options.speed ||(Math.random() * 0.0001);
    this.radius = options.radius ||  (Math.ceil(Math.random() * 10 + 2) * (Math.round(Math.random()) ? 1 : -1) );
    this.angle = options.angle || Math.ceil(Math.random() * 10) * (Math.round(Math.random()) ? 1 : -1);
    this.animations = options.animations || [];

    if(this.animations.length) {
      this.mixer = new THREE.AnimationMixer(this.model);
      this.mixer.clipAction(this.animations[0]).play();
    }
  }

  update(et, dt) {
    const centerX = 0
    const centerY = 0
  
    const x = centerX + this.radius * Math.cos(this.angle*this.speed);
    const z = centerY + this.radius * Math.sin(this.angle*this.speed);
    const y = Math.sin(this.angle*this.speed)*0.001;
  
    this.model.position.x = x;
    this.model.position.z = z;
    this.model.position.y -= y;
    this.model.lookAt(new THREE.Vector3());
    this.model.rotateY(Math.PI/2)
    this.angle += this.speed;
    if(this.mixer) {
      this.mixer.update(dt);
    }
  }
}

class Fish {
  constructor(model, options = {}) {
    this.model = model;
    this.position = options.position || model.position;
    this.size = options.size || 1;
    this.speed = options.speed ||(Math.random() * 0.0001);
    this.duration = options.duration || 1;
    this.angle = options.angle || 0;
    this.animations = options.animations || [];

    this.model.position.copy(this.position);
    this.model.scale.set(this.size, this.size, this.size);
    this.reset();
    if(this.animations.length) {
      this.mixer = new THREE.AnimationMixer(this.model);
      this.mixer.clipAction(this.animations[0]).play();
    }
  }

  reset() {
    this.model.position.y = this.position.y;  // Volver al nivel del agua
    this.model.position.z = this.position.z;  // Volver al nivel del agua
    this.jump = true;
    this.angle = 0;
    this.height = Math.random()+0.1;
  }
  update(et, dt) {
    // if(this.mixer) {
    //   this.mixer.update(dt);
    // }
    if (this.jump) {
      // Curve of the jump
      let jumpY = Math.sin(this.angle) * this.height;
      // Update the jump time
      this.angle += this.speed*dt;
      if(jumpY == 1) {
        return;
      }
      // Change the orientation
      if (this.model.position.y - (this.position.y + jumpY) < 0) {
        // Top
        this.model.rotation.x = -Math.PI / 3;  
      } else {
        // Down
        this.model.rotation.x = Math.PI /3 ;  
      }
        
      this.model.position.y = this.position.y + jumpY;

       // If the jump has finished, reset the position
       if (this.model.position.y < this.position.y) {
          this.model.position.y = this.position.y;
          this.jump = false
          setTimeout(this.reset.bind(this), Math.random() * 5000 + 3000); // Jump again between 3 and 5 seconds
      }
    }
  }
}