import * as THREE from 'three';

export class NeonGlow {
    static enhance(material, colorHex, intensity = 2.0) {
        material.color.setHex(colorHex);
        material.emissive.setHex(colorHex);
        material.emissiveIntensity = intensity;
        return material;
    }
}
