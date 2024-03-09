import { Motor } from 'lume';
import {
    ReinhardToneMapping,
    Vector2,
    ShaderMaterial,
    TextureLoader
} from 'three';
import {
    EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
    RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
    ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
    UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
    OutputPass
} from 'three/examples/jsm/postprocessing/OutputPass.js';

// Create a Motor instance
const motor = new Motor();

// Set up the tone mapping
motor.scene.glRenderer.toneMapping = ReinhardToneMapping;

// Create bloom composer
const bloomComposer = new EffectComposer(motor.scene.glRenderer);
bloomComposer.renderToScreen = false;

// Create final composer
const finalComposer = new EffectComposer(motor.scene.glRenderer);

// Create render pass
const renderPass = new RenderPass(motor.scene, motor.scene.camera);
finalComposer.addPass(renderPass);
bloomComposer.addPass(renderPass);

// Create bloom pass
const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1;
bloomPass.radius = 0.5;
bloomComposer.addPass(bloomPass);

// Load textures if needed
const textureLoader = new TextureLoader();
const baseTexture = textureLoader.load('path_to_base_texture');
const bloomTexture = textureLoader.load('path_to_bloom_texture');

// Create mix pass
const mixPass = new ShaderPass(
    new ShaderMaterial({
        uniforms: {
            baseTexture: {
                value: baseTexture
            },
            bloomTexture: {
                value: bloomComposer.renderTarget2.texture
            },
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {},
    }),
    'baseTexture',
);
mixPass.needsSwap = true;
finalComposer.addPass(mixPass);

// Create output pass
const outputPass = new OutputPass();
finalComposer.addPass(outputPass);

// Handle resizing
function handleSizing() {
    finalComposer.setPixelRatio(window.devicePixelRatio);
    bloomComposer.setPixelRatio(window.devicePixelRatio);
    finalComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
}

// Draw scene function
motor.scene.drawScene = () => {
    renderPass.camera = motor.scene.camera;
    bloomComposer.render();
    finalComposer.render();
};

// Auto rotate
const autoRotate = true;
if (autoRotate) {
    motor.rig.rotation = (x, y, z) => [x, y - 0.03, z];
} else {
    setTimeout(() => motor.scene.needsUpdate(), 100);
}

// Call handle sizing
handleSizing();

// Start the motor
motor.start();

// Export motor instance if needed
export default motor;
