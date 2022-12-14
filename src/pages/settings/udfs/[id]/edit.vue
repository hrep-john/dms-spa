<route lang="yaml">
meta:
  rolesAllowed:
    - Superadmin
    - Admin
  permissionsAllowed:
    - 'Settings: Edit User Defined Field'
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
import { useNotyf } from '/@src/composable/useNotyf'
import udfService from '/@src/stores/udfs'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit User Defined Field')

useHead({
  title: `Edit User Defined Field | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const routeParams = router.currentRoute.value.params
const service = udfService.actions
const isLoading = ref(false)
const errors = ref({
  data: [],
  show: false,
})

const breadcrumb = [
  {
    label: 'UDF List',
    icon: 'feather:columns',
    to: {
      name: 'settings-udfs',
    },
  },
  {
    label: 'Edit UDF',
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

  const response = await handleVuexApiCall(service.handleUpdateUdf, payload)

  isLoading.value = false

  if (response.success) {
    notyf.success(response.data.message)
    router.push({ name: 'settings-udfs' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const formatAttributes = (attributes: object) => {
  return attributes
}

const fetchDefaultValues = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleShowUdf, routeParams.id)

  isLoading.value = false

  if (response.success) {
    defaultValue.value = formatAttributes(response.data.result)
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'settings-udfs' })
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

      <UdfFormLayout
        title="Edit UDF"
        @submit="handleOnSubmit"
        :loading="isLoading"
        :default-value="defaultValue"
      />
    </div>
  </SidebarLayout>
</template>
