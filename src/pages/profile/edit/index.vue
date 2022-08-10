<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit Profile')

useHead({
  title: `Edit Profile - ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <EditProfileGeneral />
</template>
