import * as THREE from 'three';
import Character from './Character.js';

class World {
    constructor(options) {

      this.scene = options.scene;
      this.renderer = options.renderer;
      //this.controls = options.controls;
      this.camera = options.camera;
      this.resources = options.resources;
      this.elapsed = 1;
      this.pathPos = 0;
      this.setScene();
      this.origin = new THREE.Vector3();
    }

    setScene()
    {
      // this.resources.scene.scene.rotateY(-1.73)
      this.scene.add(this.resources.scene.scene);
      const woman = this.scene.getObjectByName("Character");
      this.catwalk = this.scene.getObjectByName("Catwalk");
      this.woman = new Character({object: woman, animations: this.resources.scene.animations, idle_name: "Idle_Neutral"});
      const dog = this.resources.dog.scene;
      this.dog = new Character({object: dog, animations: this.resources.dog.animations});
      this.scene.add(dog)
      this.scene.add(this.resources.curve_path.mesh)
      this.path = this.resources.curve_path.curve;
      this.path.closed = false;       
      // this.dog.scale.set(10,10,10)
      this.onMoveCharacter(0);
    }

    update(et, dt, grabbing)
    {

      if(!grabbing) {
        this.woman.activateAction("Idle_Neutral", 0.4);
        this.dog.activateAction("Idle", 0.4);
      }
      this.woman.update(et, dt);
      this.dog.update(et, dt);
      
    }

    onMoveCharacter(amount) {
     
      if(this.elapsed + amount > 1 || this.elapsed + amount < 0.02 ) {
        return;
      }
      this.elapsed +=amount;
     
      const position = this.path.getPointAt(this.elapsed);
      let front = this.catwalk.position.clone();
      front.subVectors(front, this.camera.position).normalize();

      let wfront = new THREE.Vector3();
      wfront.subVectors(position, this.catwalk.position);
      wfront.y = 0;
     
      wfront.normalize();      
      wfront.multiplyScalar(3);
      wfront.add(position);
   
     
      const nextPosition = this.path.getPointAt(Math.min(1, Math.max(0.02,this.elapsed + amount)));
      
      this.woman.updatePosition(position, nextPosition, amount);
      this.dog.updatePosition(position, nextPosition, amount);
    
      position.y += 1.3;
      this.camera.position.copy(wfront);
      this.camera.position.y +=1;
      
      this.camera.updateMatrix();
      this.camera.lookAt(position);
  }

    startCharacterMovement() {
      this.pathPos = this.elapsed;
    }

    endCharacterMovement() {
      this.pathPos = this.elapsed;
      this.woman.activateAction("Idle_Neutral")
    }
}

export default World