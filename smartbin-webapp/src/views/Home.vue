<template>
    <div class="container-fluid">
      <div class="d-flex flex-column h-100">
        <!-- Title of the page -->
        <div class="d-flex flex-column">
          <div class="text-center my-4">
            <h1>Smartbin Monitoring</h1>
          </div>
  
          <!-- Checkboxes for controlling display -->
          <div class="d-flex justify-content-end my-4">
            <div class="form-check me-4">
              <input class="form-check-input" type="checkbox" id="opacityCheck" v-model="opacityEnabled">
              <label class="form-check-label" for="opacityCheck">
                Enable Opacity
              </label>
            </div>
  
            <div class="form-check me-4">
              <input class="form-check-input" type="checkbox" id="binCheck" v-model="displayBin">
              <label class="form-check-label" for="binCheck">
                Display Bin
              </label>
            </div>
  
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="controllersCheck"
                v-model="displayControllers">
              <label class="form-check-label" for="controllersCheck">
                Display Controllers
              </label>
            </div>
          </div>
        </div>
  
        <!-- Three.js container, now takes the remaining height -->
        <div class="flex-grow-1 mb-4 px-4 ">
          <ThreeContainer :opacity="opacityEnabled" :bin="displayBin" :controllers="displayControllers" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ThreeContainer from '@/components/ThreeContainer.vue';
  
  // Variables for controlling visibility and opacity
  const opacityEnabled = ref(true);
  const displayBin = ref(true);
  const displayControllers = ref(true);
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
  