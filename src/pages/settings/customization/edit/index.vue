<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Customization')

useHead({
  title: `Customization | ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <CustomizationFormLayout />
</template>
