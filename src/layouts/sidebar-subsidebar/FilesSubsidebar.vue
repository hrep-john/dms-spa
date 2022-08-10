<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close'])
</script>

<template>
  <div class="sidebar-panel is-generic">
    <div class="subpanel-header">
      <h3 class="no-mb">My Files</h3>
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
        <VCollapseLinks open>
          <template #header>
            Filter By
            <i aria-hidden="true" class="iconify" data-icon="feather:chevron-right" />
          </template>

          <div class="is-submenu">
            <i aria-hidden="true" class="iconify" data-icon="feather:chevron-right"></i>
            <span>All</span>
          </div>
          <div class="is-submenu">
            <span>Documents</span>
          </div>
          <div class="is-submenu">
            <span>Photos</span>
          </div>
          <div class="is-submenu">
            <span>Videos</span>
          </div>
        </VCollapseLinks>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../scss/layout/sidebar-panel';
</style>
