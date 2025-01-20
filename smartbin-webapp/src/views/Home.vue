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
            <button @click="openModal()" class="btn btn-primary">Show graph</button>
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
      <div class="flex-grow-1 mb-4 px-3  position-relative">

        <ThreeContainer ref="threeContainerComp" :opacity="opacityEnabled" :bin="displayBin"
          :controllers="displayControllers" :openState="openState" />
          <div class="position-absolute top-0 end-0 pe-4 m-2" >Weight : {{ binWeight }}</div>
      </div>

      <!-- Vertically centered modal -->
      <div ref="modal" class="modal fade" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalLabel">
            <div class="d-flex flex-row">
          <div>Graph visualizer</div>
            <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle px-4" href="#" id="navbarScrollingDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              {{ selectedSensor }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
              <li v-if="selectedSensor != 'Accelerometer'" @click="selectedSensor = 'Accelerometer'" class="dropdown-item" type="button">Accelerometer</li>
              <li v-if="selectedSensor != 'Temperature'" @click="selectedSensor = 'Temperature'" class="dropdown-item" type="button">Temperature</li>
              <li v-if="selectedSensor != 'Humidity'" @click="selectedSensor = 'Humidity'" class="dropdown-item" type="button">Humidity</li>
            </ul>
            </div>
            </div>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <iframe
            :src="grafanaLink"
            width="100%" height="400" frameborder="0"></iframe>
        </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted,computed } from 'vue';
import ThreeContainer from '@/components/ThreeContainer.vue';
import QuickSettings from 'quicksettings';
import { Modal } from 'bootstrap';


// Variables for controlling visibility and opacity
const opacityEnabled = ref(true);
const displayBin = ref(true);
const displayControllers = ref(true);
const openState = ref(false);


const threeContainerComp = ref(null)
const threeLog = ref('')

//const settings = QuickSettings.create(0, 0, 'Dev tools');

const modal = ref(null)
const modalInstance = ref(null)

let socket;

const binWeight = ref(0)
const selectedSensor = ref('Accelerometer')

const grafanaLink = computed(() => {
  switch (selectedSensor.value) {
    case 'Accelerometer':
      return '/grafana?orgId=1&from=now-40s&to=now&timezone=browser&theme=light&panelId=1&__feature.dashboardSceneSolo'
      break;
    case 'Temperature':
      return 'http://'
      break;
    case 'Humidity':
      return 'http://'
      break;
    default:
      return ''
  }
  
})
const openModal = () => {
    modalInstance.value.show()
  }

  

onMounted(() => {
  modalInstance.value = new Modal(modal.value, {
    keyboard: false
  });


  // Ajouter des options (par exemple, un curseur, une case à cocher, etc.)
  /*settings.addBoolean("Toggle bin state", false, (value) => {
    openState.value = value;
    console.log("Feature enabled:", value);
  });*/

  /*settings.addButton("Show graph modal", () => {
    modalInstance.value.show()

  })*/



  watch(
    () => threeContainerComp.value.hoveredLidName,
    (newVal) => {
      threeLog.value = newVal

    }
  );

  // Initialize WebSocket connection
  socket = new WebSocket('ws://192.168.43.159:8090');

  socket.onopen = () => {
    console.log('WebSocket connection opened');
    //socket.send('Votre message ici');
  };

  socket.onmessage = (event) => {
    console.log('WebSocket message received:', event.data);
    data
    openState.value = event.data === "true";

    // Handle incoming messages
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };


})

onUnmounted(() => {
  //settings.destroy();
  if (socket) {
        socket.close();
      }
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