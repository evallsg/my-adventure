import * as THREE from 'three';

class Controls {
    constructor(camera, options) {
        this.camera = camera;
        this.zoomValue = options.zoom || 3.5;
        this.target = options.target || new THREE.Vector3();
        this.center = options.center || new THREE.Vector3();
        this.front = options.front || new THREE.Vector3(0,0,1);
        this.offsetY = 0;
        this.offsetX = 0;
    }

    zoom(delta) {
        this.zoomValue -= Math.sign(delta);
        if(this.zoomValue <= 3.5) {
            this.zoomValue = 3.5;
        }
        else if(this.zoomValue >= 15) {
            this.zoomValue = 15;
        }
 
        this.update(this.target);
    }

    update(target, offsetY = this.offsetY) {
        // Compute front direction from target on Y-plane
        let front = new THREE.Vector3();
        front.subVectors(target, this.center);
        front.y = 0;
        front.normalize(); 
            
        // Compute camera position taking into account the camera zoom   
        front.multiplyScalar(this.zoomValue);
        front.add(target);

        // Put the camera a little up of the character
        this.camera.position.copy(front);
        this.camera.position.y +=(1.5 + offsetY);
        this.target = target.clone();
        target.y += (1.5 );
        
        this.camera.updateMatrix();
        this.camera.lookAt(target);

        this.offsetY = offsetY;
    }
}

export default Controls;