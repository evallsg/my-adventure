import * as THREE from 'three'

import Loader from './Loader.js'

class Resources
{
    constructor(onLoaded)
    {

        this.loader = new Loader()
        this.items = {}

        this.loader.load([      
    
            // Scene
            { name: 'scene', source: './data/models/mountain_scene.glb' },
            { name: 'character', source: './data/models/Character.glb' },
            { name: 'dog', source: './data/models/ShibaInu.glb' },
            { name: 'curve_path', source: './data/models/mountain_scene.json' },
          
        ]).then((values) => {
            
            onLoaded(this.loader.items);
        })

    //     this.loader.on('fileEnd', (_resource, _data) =>
    //     {
    //         this.items[_resource.name] = _data

    //         // Texture
    //         if(_resource.type === 'texture')
    //         {
    //             const texture = new THREE.Texture(_data)
    //             texture.needsUpdate = true

    //             this.items[`${_resource.name}Texture`] = texture
    //         }

    //         // Trigger progress
    //         this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
    //     })

    //     this.loader.on('end', () =>
    //     {
    //         // Trigger ready
    //         this.trigger('ready')
    //     })
    }
}

export {Resources}