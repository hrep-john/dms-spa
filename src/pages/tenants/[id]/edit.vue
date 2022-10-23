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
import { useNotyf } from '/@src/composable/useNotyf'
import tenantService from '/@src/stores/tenants'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit Tenant')

useHead({
  title: `Edit Tenant | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const routeParams = router.currentRoute.value.params
const service = tenantService.actions
const isLoading = ref(false)

const breadcrumb = [
  {
    label: 'Tenant List',
    icon: 'fa-building',
    to: {
      name: 'tenants',
    },
  },
  {
    label: 'Edit Tenant',
  },
]

const defaultValue = ref()

const handleOnSubmit = async (data: any) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = data
  payload.tenant_id = routeParams.id
  payload.id = routeParams.id

  const response = await handleVuexApiCall(service.handleUpdateTenant, payload)

  isLoading.value = false

  if (response.success) {
    notyf.success(response.data)
    router.push({ name: 'tenants' })
  } else {
    const errors = response?.body?.errors

    if (errors === null) {
      notyf.error(response?.body?.message)
    } else {
      for (let key of Object.keys(errors)) {
        errors[key].forEach((error) => {
          notyf.error(error)
        })
      }
    }
  }
}

const fetchDefaultValues = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleShowTenant, routeParams.id)

  isLoading.value = false

  if (response.success) {
    defaultValue.value = response.data.result
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'tenants' })
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

      <TenantFormLayout
        title="Edit Tenant"
        @submit="handleOnSubmit"
        :loading="isLoading"
        :errors="errors"
        :default-value="defaultValue"
      />
    </div>
  </SidebarLayout>
</template>
