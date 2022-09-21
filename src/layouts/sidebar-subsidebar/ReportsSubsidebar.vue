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
      <li>
        <RouterLink :to="{ name: 'report-builders' }">Report Builder</RouterLink>
      </li>

      <li class="divider"></li>
      <ul>
        <VCollapseLinks v-model:open="openSubsidebarLinks" collapse-id="document">
          <template #header>
            Document
            <i aria-hidden="true" class="iconify" data-icon="feather:chevron-right" />
          </template>

          <RouterLink :to="{ name: 'users' }" class="is-submenu">
            <i aria-hidden="true" class="lnir lnir-passport"></i>
            <span>Sample Report 1</span>
          </RouterLink>
          <RouterLink :to="{ name: 'tenants' }" class="is-submenu">
            <i aria-hidden="true" class="lnir lnir-passport"></i>
            <span>Sample Report 2</span>
          </RouterLink>
        </VCollapseLinks>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../scss/layout/sidebar-panel';
</style>
