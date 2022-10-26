<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserSession } from '/@src/stores/userSession'
import { groupBy } from '/@src/utils/helper'
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
const userSession = useUserSession()
const openSubsidebarLinks = ref('')
const emit = defineEmits(['close'])

const props = defineProps({
  customReports: {
    type: Array,
    default: [],
  },
})

onMounted(() => {
  openSubsidebarLinks.value = viewWrapper.getSubsidebarDropdown()
})

const isSuperadmin = computed(() => {
  const roles = userSession.roles ? JSON.parse(userSession.roles) : []

  return roles.includes('superadmin')
})

const customReports = computed(() => {
  return groupBy(props.customReports || [], 'module')
})

watch(
  () => openSubsidebarLinks.value,
  (value) => {
    if (value) {
      viewWrapper.setSubsidebarDropdown(value)
    }
  }
)
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
      <li v-if="isSuperadmin">
        <RouterLink :to="{ name: 'report-builders' }">Report Builder</RouterLink>
      </li>

      <li v-if="isSuperadmin" class="divider"></li>

      <ul>
        <VCollapseLinks
          v-for="(customModuleReports, module) in customReports"
          :key="module"
          v-model:open="openSubsidebarLinks"
          :collapse-id="module"
        >
          <template #header>
            {{ module }}
            <i aria-hidden="true" class="iconify" data-icon="feather:chevron-right" />
          </template>

          <RouterLink
            v-for="(customReport, key) in customModuleReports"
            :key="key"
            :to="'/custom-reports/' + customReport.slug"
            class="is-submenu"
          >
            <i aria-hidden="true" class="lnir lnir-passport"></i>
            <span>{{ customReport.name }}</span>
          </RouterLink>
        </VCollapseLinks>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../scss/layout/sidebar-panel';
</style>
