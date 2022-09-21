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
const errors = ref({
  data: [],
  show: false,
})

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

const formatErrors = (errors: any) => {
  const errorLists = []

  for (let item in errors) {
    for (let i = 0; i < errors[item].length; i++) {
      errorLists.push(errors[item][i])
    }
  }

  return errorLists
}

const handleOnSubmit = async (data: any) => {
  errors.value.data = []
  isLoading.value = true

  const payload = data
  payload.tenant_id = routeParams.id

  service
    .handleUpdateTenant(payload, routeParams.id)
    .then((response) => {
      isLoading.value = false
      notyf.success(response)
      router.push({ name: 'tenants' })
    })
    .catch((error) => {
      notyf.error(error.response.data.message)
      errors.value.show = true
      errors.value.data = formatErrors(error.response.data.errors)
      isLoading.value = false
    })
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
