<route lang="yaml">
meta:
  rolesAllowed: 
    - Superadmin
</route>

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
import { ref, onMounted } from 'vue'
import { useUserSession } from '/@src/stores/userSession'
import { useNotyf } from '/@src/composable/useNotyf'
import reportBuilderService from '/@src/stores/reportBuilders'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

const router = useRouter()
const notyf = useNotyf()
const userSession = useUserSession()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit Custom Report')

useHead({
  title: `Edit Custom Report | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const routeParams = router.currentRoute.value.params
const service = reportBuilderService.actions
const isLoading = ref(false)
const errors = ref({
  data: [],
  show: false,
})

const breadcrumb = [
  {
    label: 'Report Builder List',
    icon: 'feather:file-text',
    to: {
      name: 'report-builders',
    },
  },
  {
    label: 'Edit Custom Report',
  },
]

const defaultValue = ref()

const handleOnSubmit = async (data: any) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    id: routeParams.id,
    ...data,
  }

  const response = await handleVuexApiCall(service.handleUpdateReportBuilder, payload)

  isLoading.value = false

  if (response.success) {
    notyf.success(response.data.message)
    router.push({ name: 'report-builders' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const fetchDefaultValues = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(
    service.handleShowReportBuilder,
    routeParams.id
  )

  isLoading.value = false

  if (response.success) {
    const result = response.data.result
    defaultValue.value = result
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'report-builders' })
  }
}

onMounted(async () => {
  await fetchDefaultValues()
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
      <VBreadcrumb :items="breadcrumb" separator="arrow" with-icons />

      <VProgress size="tiny" v-show="isLoading" />

      <ReportBuilderFormLayout
        title="Edit Custom Report"
        @submit="handleOnSubmit"
        :loading="isLoading"
        :default-value="defaultValue"
      />
    </div>
  </SidebarLayout>
</template>
