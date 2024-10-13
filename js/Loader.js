import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { loadCurveFromJSON } from './external/CurveMethods.js'
class Loader
{
    /**
     * Constructor
     */
    constructor()
    {

        this.setLoaders()

        this.toLoad = 0
        this.loaded = 0
        this.items = {}

        this.promises = [];
    }

    /**
     * Set loaders
     */
    setLoaders()
    {
        this.loaders = []

        // Images
        this.loaders.push({
            extensions: ['jpg', 'png', 'webp'],
            action: (_resource) =>
            {
                const image = new Image()

                image.addEventListener('load', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.addEventListener('error', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.src = _resource.source
            }
        })

        const rgbeLoader = new RGBELoader();
        rgbeLoader.setPath( 'data/' )
        this.loaders.push({
            extensions: ['hdr'],
            action: (_resource) =>
            {
                const promise = new Promise((resolve, reject) => {
                    rgbeLoader.load(_resource.source, (_data) => {resolve(_data); fileLoadEnd(_resource, _data)});
                })
                this.promises.push(promise);
            }
        })
        // Draco
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')
        dracoLoader.setDecoderConfig({ type: 'js' })

        this.loaders.push({
            extensions: ['drc'],
            action: (_resource) =>
            {
                const promise = new Promise((resolve, reject) => {
                    dracoLoader.load(_resource.source, (_data) => {resolve(_data); DRACOLoader.releaseDecoderModule(); fileLoadEnd(_resource, _data)});
                })
                this.promises.push(promise);
                // dracoLoader.load(_resource.source, (_data) =>
                // {
                //     this.fileLoadEnd(_resource, _data)

                //     DRACOLoader.releaseDecoderModule()
                // })
            }
        })

        // GLTF
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (_resource) =>
            {
                const promise = new Promise((resolve, reject) => {
                    gltfLoader.load(_resource.source, data=> {  this.fileLoadEnd(_resource, data); resolve(data);}, null, reject);
                });

                this.promises.push(promise);
                // gltfLoader.load(_resource.source, (_data) =>
                // {
                //     this.fileLoadEnd(_resource, _data)
                // })
            }
        })

        // JSON curve         
        this.loaders.push({
            extensions: ['json'],
            action: (_resource) =>
            {
                const promise = new Promise(async (resolve, reject) => {
                let data = await loadCurveFromJSON(_resource.source);
                this.fileLoadEnd(_resource, data); 
                resolve(data);
                });

                this.promises.push(promise);
                // gltfLoader.load(_resource.source, (_data) =>
                // {
                //     this.fileLoadEnd(_resource, _data)
                // })
            }
        })
    }

    /**
     * Load
     */
    async load(_resources = [])
    {
        for(const _resource of _resources)
        {
            this.toLoad++
            const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

            if(typeof extensionMatch[1] !== 'undefined')
            {
                const extension = extensionMatch[1]
                const loader = this.loaders.find((_loader) => _loader.extensions.find((_extension) => _extension === extension))

                if(loader)
                {
                    loader.action(_resource)
                }
                else
                {
                    console.warn(`Cannot found loader for ${_resource}`)
                }
            }
            else
            {
                console.warn(`Cannot found extension of ${_resource}`)
            }
        }
        return Promise.all(this.promises);
    }

    /**
     * File load end
     */
    fileLoadEnd(_resource, _data)
    {
        this.loaded++
        this.items[_resource.name] = _data
       
        // this.trigger('fileEnd', [_resource, _data])

        // if(this.loaded === this.toLoad)
        // {
        //     this.trigger('end')
        // }
    }
}

export default Loader