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
import { ref } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import tenantService from '/@src/stores/tenants'
import { useRouter } from 'vue-router'

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Add Tenant')

useHead({
  title: `Add Tenant | ${import.meta.env.VITE_PROJECT_NAME}`,
})

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
    label: 'Add Tenant',
  },
]

const formatErrors = (errors: any) => {
  const errorLists = []

  for (let item in errors) {
    for (let i = 0; i < errors[item].length; i++) {
      errorLists.push(errors[item][i])
    }
  }

  return errorLists
}

const validateData = (data: any) => {
  let errors = []

  if (data.password !== data.confirm_password) {
    errors.push('The password confirmation does not match.')
  }

  return errors
}

const handleOnSubmit = async (data: any) => {
  errors.value.data = []
  isLoading.value = true

  errors.value.data = [...validateData(data)]

  if (errors.value.data.length !== 0) {
    errors.value.show = true
    return false
  }

  service
    .handleStoreTenant(data)
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
        @submit="handleOnSubmit"
        :errors="errors"
        :loading="isLoading"
        :is-new="true"
        title="Add Tenant"
      />
    </div>
  </SidebarLayout>
</template>
