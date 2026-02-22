import * as THREE from 'three';

export class TextureCompressor {
    static optimize(texture) {
        texture.anisotropy = 4; // Max on most devices
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }
}
