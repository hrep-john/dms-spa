<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Tenant Settings')

useHead({
  title: `Tenant Settings | ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <TenantSettingsFormLayout />
</template>
