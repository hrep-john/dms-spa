<route lang="yaml">
meta:
  rolesAllowed: 
    - Superadmin
    - Admin
  permissionsAllowed:
    - 'Role: Edit User'
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
import roleService from '/@src/stores/roles'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

const router = useRouter()
const notyf = useNotyf()
const userSession = useUserSession()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit Role')

useHead({
  title: `Edit Role | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const routeParams = router.currentRoute.value.params
const service = roleService.actions
const isLoading = ref(false)
const errors = ref({
  data: [],
  show: false,
})

const breadcrumb = [
  {
    label: 'Role List',
    icon: 'feather:role',
    to: {
      name: 'roles',
    },
  },
  {
    label: 'Edit Role',
  },
]

const defaultValue = ref()

const handleOnSubmit = async (data: any) => {
  isLoading.value = true

  if (!isLoading.value) {
    return
  }

  const payload = {
    id: routeParams.id,
    ...data,
  }

  const response = await handleVuexApiCall(service.handleUpdateRole, payload)

  isLoading.value = false

  if (response.success) {
    notyf.success(response.data.message)
    router.push({ name: 'roles' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

onMounted(async () => {
  isLoading.value = true

  const response = await handleVuexApiCall(service.handleShowRole, routeParams.id)

  isLoading.value = false

  if (response.success) {
    defaultValue.value = response.data.result
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'roles' })
  }
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

      <RoleFormLayout
        title="Edit Role"
        @submit="handleOnSubmit"
        :loading="isLoading"
        :default-value="defaultValue"
      />
    </div>
  </SidebarLayout>
</template>
