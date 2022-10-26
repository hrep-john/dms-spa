<route lang="yaml">
meta:
  rolesAllowed:
    - Superadmin
    - Admin
  permissionsAllowed:
    - 'Settings: Create User Defined Field'
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
import { ref } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import udfService from '/@src/stores/udfs'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Add User Defined Field')

useHead({
  title: `Add User Defined Field | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const service = udfService.actions
const isLoading = ref(false)

const breadcrumb = [
  {
    label: 'UDF List',
    icon: 'feather:columns',
    to: {
      name: 'settings-udfs',
    },
  },
  {
    label: 'Add UDF',
  },
]

const handleOnSubmit = async (data: any) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleStoreUdf, data)

  isLoading.value = false

  if (response.success) {
    notyf.success(response.data)
    router.push({ name: 'settings-udfs' })
  } else {
    const errors = response?.body?.errors

    for (let key of Object.keys(errors)) {
      errors[key].forEach((error) => {
        notyf.error(error)
      })
    }
  }
}
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
        @submit="handleOnSubmit"
        :errors="errors"
        :loading="isLoading"
        :is-new="true"
        title="Add User Defined Field"
      />
    </div>
  </SidebarLayout>
</template>
