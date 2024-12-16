<template>
  <div class="rounded shadow " ref="threeContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const rotationSpeed = 0.002;
const rotation = ref(rotationSpeed);
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
  },
  openState: {
    type: Boolean,
    default: false
  }
});

// Reference for the DOM container

const threeContainer = ref(null);
const hoveredLidName = ref('')
let renderer, scene, camera, binModel, binMaterial, hoveredObject, mouse, raycaster, binClosedRotation, controllersModels = [];


function onMouseMove(event) {
  // Convert mouse position to normalized device coordinates
  const rect = threeContainer.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseClick(event) {
  if (hoveredObject) {

  }
}

// Handle window resize
const handleResize = () => {
  if (!renderer) return
  camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
};



onMounted(() => {
  if (!threeContainer.value) return;

  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef8f6);

  /// hover display on the bin controllers
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
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


  window.addEventListener('resize', handleResize);

  // Load the main model (bin)
  const loader = new GLTFLoader();
  const modelPath = '/smartbin_3d/bin/model.glb'; // Replace with actual bin model path
  const controllersPath = ['/smartbin_3d/lid/bincontroller.glb', '/smartbin_3d/lid/lockercontroller.glb']; // Replace with actual controllers model path

  loader.load(modelPath, (gltf) => {
    binModel = gltf.scene;
    scene.add(binModel);
    const binUp = binModel.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1];

    binClosedRotation = binUp.rotation.x;
    binModel.traverse((child) => {
      if (child.isMesh) {
        binMaterial = child.material;

        // Copy the material properties to preserve existing textures
        const updatedMaterial = new THREE.MeshStandardMaterial({
          ...binMaterial, // Copy the existing material properties
          transparent: true,
          opacity: 0.2, // Set opacity based on the 'opacity' prop
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
      binModel.rotation.y += rotation.value;
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
        model.rotation.y += rotation.value;


        // Update the raycaster with the mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects(controllersModels);

        if (intersects.length > 0 && intersects[0].object.name.startsWith('Box')) {
          // Highlight the first intersected object
          const object = intersects[0].object;
          console.log()

          if (hoveredObject !== object) {
            // Restore the previous hovered object
            if (hoveredObject) hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
            hoveredLidName.value = object.name.replace('Box_', '');

            // Store the current color
            hoveredObject = object;
            hoveredObject.currentHex = hoveredObject.material.emissive.getHex();
            hoveredObject.material.emissive.setHex(0xff0000); // Highlight with red emissive
            rotation.value = 0;
            threeContainer.value.style.cursor = "pointer";

          }
        } else {
          // Restore the previous hovered object
          if (hoveredObject) hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
          hoveredLidName.value = '';

          hoveredObject = null;
          rotation.value = rotationSpeed;
          threeContainer.value.style.cursor = "default";

        }

        renderer.render(scene, camera);
      };
      animate();
      model.position.set(0, -100, -100);
    });
  });

  threeContainer.value.addEventListener('mousemove', onMouseMove);
  threeContainer.value.addEventListener('click', onMouseClick);
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
        if (child.isMesh && binMaterial) {

          child.material.transparent = props.opacity ? true : false; // Apply the updated material
          child.material.opacity = props.opacity ? 0.2 : 1; // Set opacity based on the 'opacity' prop
          child.material.depthWrite = props.opacity ? false : true;
          child.material.side = props.opacity ? THREE.FrontSide : THREE.FrontSide;
          child.material.alphaTest = props.opacity ? 0.1 : 0;
        }
      });
    }
  }
);

watch(
  () => props.openState,
  (newVal) => {
    const binUp = binModel.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1];
    
    let targetRotation = newVal ? binClosedRotation - 0.6 : binClosedRotation;  

    const animateRotate = () => {
      const rotationSpeed = 0.01;  // La vitesse de l'animation
      const diff = targetRotation - binUp.rotation.x;  // Calculer la différence entre la rotation actuelle et la cible

      // Si la différence est suffisamment grande, on continue l'animation
      if (Math.abs(diff) > rotationSpeed) {
        binUp.rotation.x += Math.sign(diff) * rotationSpeed;  // Incrémenter la rotation selon la direction
        requestAnimationFrame(animateRotate);  // Demander une nouvelle frame pour l'animation
      } else {
        binUp.rotation.x = targetRotation;  // Ajuster précisément la rotation une fois la cible atteinte
      }
    };

    animateRotate();
  }
);


onUnmounted(() => {
  threeContainer.value.removeEventListener('mousemove', onMouseMove);
  threeContainer.value.removeEventListener('click', onMouseClick);

  window.removeEventListener('resize', handleResize);
  renderer.dispose();
});

defineExpose({
  hoveredLidName
})
</script>

<style scoped>
div {
  display: block;
  position: relative;
  overflow: hidden;
}
</style>
