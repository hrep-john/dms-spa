<script setup lang="ts">
/**
 * This is a Vue Component that will be
 * automatically mapped to a entry on vue-router.
 *
 * You will be able to access this page at http://localhost:3000/starters/sidebar-blank-page-1
 * Page uri will match related path to src/pages folder
 *
 * Read more about routing:
 * @see /vite.config.ts
 * @see /src/router.ts
 */

import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { onMounted, ref } from 'vue'
import { handleVuexApiCall } from '/@src/utils/helper'
import { useNotyf } from '/@src/composable/useNotyf'
import dashboardServices from '/@src/stores/dashboard'

useHead({
  title: `Dashboard - ${import.meta.env.VITE_PROJECT_NAME}`,
})

const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Dashboard')

const service = dashboardServices.actions
const isLoading = ref(false)
const dashboard = ref({})

const getDashboard = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    per_page: 5,
  }

  const response = await handleVuexApiCall(service.handleGetDashboard, payload)

  if (response.success) {
    dashboard.value = response.data
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

onMounted(async () => {
  await getDashboard()
})
</script>

<template>
  <SidebarLayout>
    <!-- Content Wrapper -->
    <div class="page-content-inner">
      <!--
          Page content goes here

          You can see pages content samples from 
          files in /src/components/pages directory
        -->

      <UserDashboard :data="dashboard" :is-loading="isLoading" />
    </div>
  </SidebarLayout>
</template>
