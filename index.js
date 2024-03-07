varying vec2 vUv;

	void main() {

		vUv = uv;

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}
</script>

<script type="x-shader/x-fragment" id="fragmentshader">
	uniform sampler2D baseTexture;
	uniform sampler2D bloomTexture;

	varying vec2 vUv;

	void main() {

		gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

	}
</script>

<script type="module">
	import {
		Motor
	} from 'lume'
	import {
		ReinhardToneMapping,
		Vector2,
		ShaderMaterial
	} from 'three'
	import {
		EffectComposer
	} from 'three/addons/postprocessing/EffectComposer.js'
	import {
		RenderPass
	} from 'three/addons/postprocessing/RenderPass.js'
	import {
		ShaderPass
	} from 'three/addons/postprocessing/ShaderPass.js'
	import {
		UnrealBloomPass
	} from 'three/addons/postprocessing/UnrealBloomPass.js'
	import {
		OutputPass
	} from 'three/addons/postprocessing/OutputPass.js'
	scene.glRenderer.toneMapping = ReinhardToneMapping
	const bloomComposer = new EffectComposer(scene.glRenderer)
	bloomComposer.renderToScreen = false
	const finalComposer = new EffectComposer(scene.glRenderer)
	const renderPass = new RenderPass(scene.three, scene.threeCamera)
	finalComposer.addPass(renderPass)
	bloomComposer.addPass(renderPass)
	const bloomPass = new UnrealBloomPass(
		new Vector2(scene.clientWidth, scene.clientHeight),
		// 1.5, 0.4, 0.85
	)
	bloomPass.threshold = 0
	bloomPass.strength = 1
	bloomPass.radius = 0.5
	bloomComposer.addPass(bloomPass)
	const mixPass = new ShaderPass(
		new ShaderMaterial({
			uniforms: {
				baseTexture: {
					value: null
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
	)
	mixPass.needsSwap = true
	finalComposer.addPass(mixPass)
	const outputPass = new OutputPass()
	finalComposer.addPass(outputPass)

	function handleSizing() {
		finalComposer.setPixelRatio(window.devicePixelRatio)
		bloomComposer.setPixelRatio(window.devicePixelRatio)
		const resize = () => {
			finalComposer.setSize(scene.clientWidth, scene.clientHeight)
			bloomComposer.setSize(scene.clientWidth, scene.clientHeight)
		}
		const observer = new ResizeObserver(resize)
		observer.observe(scene)
	}
	// If you do things manually with Three.js, you need to make sure to set the
	// proper rendering dimensions. Comment this out and it will still work, but
	// the demo may be lower resolution and look pixelated.
	handleSizing()
	scene.drawScene = () => {
		// If there are multiple cameras in the Lume scene, make sure to always
		// use the currently-active camera.
		renderPass.camera = scene.threeCamera
		stars.three.material.color.set('black')
		bloomComposer.render()
		stars.three.material.color.set('white')
		finalComposer.render()
	}
	const autoRotate = true
	if (autoRotate) {
		rig.rotation = (x, y, z) => [x, y - 0.03, z]
	} else {
		// TODO When there's no animation, not sure why the scene needs to be
		// re-drawn a single frame a little *later* for things to become
		// visible for the first time.
		setTimeout(() => scene.needsUpdate(), 100)
	}