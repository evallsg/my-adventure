import * as THREE from 'three';

class Character {
    constructor( options = {} ) {
        this.size = options.size ?? 1.0;
        this.speed = options.speed ?? 1.0;
        this.model = options.object.parser ? options.object.scene : options.object;
        if(options.position) {
            this.model.position.copy(options.position);
        }

        this.currentAnimation = "Walk";
        this.mixer = new THREE.AnimationMixer(this.model);
        this.animations = {};
        this.IDLE = options.idle_name || "Idle";
        this.WALK = options.walk_name || "Walk";
        this.RUN = options.run || "Run";
        if(options.animations) {

            for(let i = 0; i < options.animations.length; i++) {
                const clip = options.animations[i];
                const action = this.mixer.clipAction( clip ).setEffectiveWeight(0).play();
                this.animations[clip.name] = action;
            }
            this.animations[this.currentAnimation].setEffectiveWeight(1.0);
        }
        
    }

    updatePosition(position, nextPosition, delta) {
        this.model.position.copy(position);
        if(Math.abs(delta) > 0.0001) {
            this.model.lookAt(nextPosition);
            if(Math.abs(delta) < 0.0001) {
                this.activateAction(this.IDLE);
            }
            else {
                if(Math.abs(delta) > 0.005) {
                    this.activateAction(this.RUN, 0.1);

                } else {
                    this.activateAction(this.WALK);
                }
            }
        } else {
            
            this.activateAction(this.IDLE);
            
        }
    }

    getPosition() {
        return this.model.position;
    }

    update(et, dt) {
        
        if(this.mixer) {
            this.mixer.update(dt);
        }
    }
    
    setActionSpeed(speed) {
        this.animations[this.currentAnimation].timeScale=speed;
    }

    activateAction( name, duration = 0.2 ) {
        
        if(this.currentAnimation != name) {     
            //this.animations[name].time = 0;
            this.animations[name].enabled = true;
            this.animations[name].setEffectiveTimeScale( 1 );
            this.animations[name].setEffectiveWeight(1.0);
            this.animations[this.currentAnimation].crossFadeTo( this.animations[name], duration, true );;
            this.currentAnimation = name;
        }
    }

    moveForward(amount = 0.1) {
        this.model.position.x += amount;
    }

}
export default Character