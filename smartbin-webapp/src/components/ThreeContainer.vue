<template>
  <div class="rounded shadow " ref="threeContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, onUnmounted, defineProps, ref, watch } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const rotation = 0.005;
// Define props to control visibility and opacity
const props = defineProps({
  opacity: {
    type: Boolean,
    default: false
  },
  bin: {
    type: Boolean,
    default: true
  },
  controllers: {
    type: Boolean,
    default: true
  }
});

// Reference for the DOM container
const threeContainer = ref(null);

let renderer, scene, camera, binModel, binMaterial, controllersModels = [];

onMounted(() => {
  if (!threeContainer.value) return;

  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef8f6);

  // Add ambient light
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  hemisphereLight.position.set(0, 50, 0);
  scene.add(hemisphereLight);

  // Add a camera
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );

  // Setup the renderer with antialiasing
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  threeContainer.value.appendChild(renderer.domElement);

  // Handle window resize
  const handleResize = () => {
    camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // Load the main model (bin)
  const loader = new GLTFLoader();
  const modelPath = '/smartbin_3d/bin/model1.glb'; // Replace with actual bin model path
  const controllersPath = ['/smartbin_3d/lid/bincontroller.glb']; // Replace with actual controllers model path

  loader.load(modelPath, (gltf) => {
    binModel = gltf.scene;
    scene.add(binModel);
    binModel.traverse((child) => {
      if (child.isMesh) {
        binMaterial = child.material;

        // Copy the material properties to preserve existing textures
        const updatedMaterial = new THREE.MeshStandardMaterial({
          ...binMaterial, // Copy the existing material properties
          transparent: true,
          opacity:  0.2, // Set opacity based on the 'opacity' prop
          depthWrite: false,
          //depthTest: true,
          side: THREE.DoubleSide,
          alphaTest: 0.1,
        });

        child.material = updatedMaterial; // Apply the new material to the mesh
      }
    });

    // Rotate the bin model
    const animate = () => {
      requestAnimationFrame(animate);
      binModel.rotation.y +=  rotation;
      renderer.render(scene, camera);
    };
    animate();
    binModel.position.set(0, -100, -100);
  });

  // Load additional controllers
  controllersPath.forEach((modelPath) => {
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      controllersModels.push(model);
      scene.add(model);
      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y +=  rotation;
        renderer.render(scene, camera);
      };
      animate();
      model.position.set(0, -100, -100);
    });
  });

  // Set camera position and direction
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);
});

// Watch for changes in props to update the scene dynamically
watch(
  () => props.bin,
  (newVal) => {
    if (binModel) {
      binModel.visible = newVal;
    }
  }
);

watch(
  () => props.controllers,
  (newVal) => {
    controllersModels.forEach((model) => {
      model.visible = newVal;
    });
  }
);

watch(
  () => props.opacity,
  (newVal) => {
    if (binModel) {
      binModel.traverse((child) => {
        if (child.isMesh && binMaterial  ) {

          child.material.transparent = props.opacity ?  true : false ; // Apply the updated material
          child.material.opacity =   props.opacity ?0.2 :  1  ; // Set opacity based on the 'opacity' prop
          child.material.depthWrite =  props.opacity ? false: true ;
          child.material.side =  props.opacity ?  THREE.FrontSide : THREE.FrontSide ;
          child.material.alphaTest = props.opacity ? 0.1 : 0 ;
        }
      });
    }
  }
);

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  renderer.dispose();
});
</script>

<style scoped>
div {
  display: block;
  position: relative;
  overflow: hidden;
}
</style>
