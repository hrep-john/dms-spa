<script setup lang="ts">
import { ref } from 'vue'

const openSubsidebarLinks = ref('')
const emit = defineEmits(['close'])
</script>

<template>
  <div class="sidebar-panel is-generic">
    <div class="subpanel-header">
      <ProjectsQuickDropdown />

      <h3 class="no-mb">Reports</h3>
      <div
        class="panel-close"
        tabindex="0"
        @keydown.space.prevent="emit('close')"
        @click="emit('close')"
      >
        <i aria-hidden="true" class="iconify" data-icon="feather:x"></i>
      </div>
    </div>
    <div class="inner" data-simplebar>
      <ul>
        <li>
          <div class="subsidebar-single-link">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="foundation:graph-pie"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="foundation:graph-trend"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="entypo:bar-graph"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="entypo:area-graph"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="material-symbols:auto-graph-rounded"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../scss/layout/sidebar-panel';
</style>
