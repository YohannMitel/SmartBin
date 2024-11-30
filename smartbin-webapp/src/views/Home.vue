<template>
  <div id="container" class="container-fluid">
    <div class="d-flex flex-column h-100">
      <!-- Title of the page -->
      <div class="d-flex flex-column">
        <div class="text-center my-4">
          <h1>Smartbin Monitoring</h1>
        </div>

        <div class="d-flex flex-row justify-content-between ">


          <div class="m-4">
            {{ threeLog }}
          </div>
          <!-- Checkboxes for controlling display -->
          <div class="d-flex  flex-row  my-4">


            <div class="form-check me-4 px-2">
              <input class="form-check-input" type="checkbox" id="opacityCheck" v-model="opacityEnabled">
              <label class="form-check-label" for="opacityCheck">
                Enable opacity
              </label>
            </div>

            <div class="form-check me-4 px-2">
              <input class="form-check-input" type="checkbox" id="binCheck" v-model="displayBin">
              <label class="form-check-label" for="binCheck">
                Display bin
              </label>
            </div>

            <div class="form-check px-2">
              <input class="form-check-input" type="checkbox" id="controllersCheck" v-model="displayControllers">
              <label class="form-check-label" for="controllersCheck">
                Display controllers
              </label>
            </div>
          </div>
        </div>
      </div>


      <!-- Three.js container, now takes the remaining height -->
      <div class="flex-grow-1 mb-4 px-4 ">
        <ThreeContainer ref="threeContainerComp" :opacity="opacityEnabled" :bin="displayBin" :controllers="displayControllers" :openState="openState" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted } from 'vue';
import ThreeContainer from '@/components/ThreeContainer.vue';
import QuickSettings from 'quicksettings';


// Variables for controlling visibility and opacity
const opacityEnabled = ref(true);
const displayBin = ref(true);
const displayControllers = ref(true);
const openState=ref(false);


const threeContainerComp = ref(null)
const threeLog = ref('')

const settings = QuickSettings.create(0, 0 ,'Dev tools');




onMounted(() => {

  // Ajouter des options (par exemple, un curseur, une case à cocher, etc.)
  settings.addBoolean("Toggle bin state", false, (value) => {
    openState.value = value;
    console.log("Feature enabled:", value);
  });



  watch(
    () => threeContainerComp.value.hoveredLidName,
    (newVal) => {
      threeLog.value = newVal

    }
  );

})

onUnmounted(()=>{
  settings.destroy();
})

</script>

<style scoped>
/* Style for the container */
.container-fluid {
  height: 100vh;
  background-color: #f4f4f4;
}

/* The flex column ensures that children are laid out vertically */
.d-flex {
  display: flex;
}

.h-100 {
  height: 100%;
}

/* The .flex-grow-1 makes the Three.js container take up the remaining space */
.flex-grow-1 {
  flex-grow: 1;
}

/* Additional styling for the title and checkboxes */
h1 {
  font-size: 3rem;
}

.form-check {
  display: inline-block;
  margin-right: 20px;
}
</style>