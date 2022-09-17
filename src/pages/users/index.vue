<route lang="yaml">
meta:
  rolesAllowed:
    - superadmin
    - admin
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
import { onMounted, ref, computed, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import userService from '/@src/stores/users'
import debounce from 'lodash.debounce'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

useHead({
  title: `User List - ${import.meta.env.VITE_PROJECT_NAME}`,
})

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('User List')

const service = userService.actions

const isLoading = ref(true)
const search = ref('')
const datatable = ref({ data: [], meta: {} })
const page = ref(1)
const deleteConfirm = ref({ visible: false, selected: 0 })

const columns = {
  username: 'User ID',
  email: 'Email',
  full_name: 'Full Name',
  roles: 'Roles',
  actions: {
    label: 'Actions',
    align: 'end',
  },
} as const

const paginate = async (page = 1) => {
  isLoading.value = true

  const payload = {
    page: page,
    per_page: 10,
    filters: buildFilters(),
  }

  const response = await handleVuexApiCall(service.handleGetUsers, payload)

  if (response.success) {
    const formatted = formatData(response.data.results.data)
    datatable.value.data = datatable.value.data.concat(formatted)
    datatable.value.meta = response.data.results.meta
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const buildFilters = () => {
  const columns = [
    'tenants.name',
    'users.username',
    'users.email',
    'user_infos.first_name',
    'user_infos.middle_name',
    'user_infos.last_name',
  ]
  const filters = Array()

  columns.forEach((column) => {
    if (search.value != '') {
      filters.push({
        column: column,
        join: 'or',
        operator: 'LIKE',
        value: `%${search.value}%`,
      })
    }
  })

  return filters
}

function formatData(data: any) {
  let formatted = []

  for (let i = 0; i < data.length; i++) {
    const user = data[i]

    formatted.push({
      id: user.id,
      tenant_name: user.user_info.tenant_name,
      full_name: `${user.user_info.first_name ?? ''} ${
        user.user_info.middle_name ?? ''
      } ${user.user_info.last_name ?? ''}`,
      username: user.username,
      email: user.email,
      roles: user.roles.join(', '),
    })
  }

  return formatted
}

const searchRecords = debounce(async () => {
  await clearRecords()
  await paginate()
}, 500)

const clearRecords = async () => {
  datatable.value.data = []
  datatable.value.meta = {}
  page.value = 1
}

const onHandleUpdateRecord = (id: any) => {
  router.push(`/users/${id}/edit`)
}

const onHandleDeleteRecord = (id: any) => {
  deleteConfirm.value.visible = true
  deleteConfirm.value.selected = id
}

const isLastPage = computed(() => {
  if (!datatable.value.hasOwnProperty('meta')) {
    return true
  }

  return datatable.value.meta.current_page >= datatable.value.meta.last_page
})

const loadMore = async () => {
  await paginate(++page.value)
}

const getSelectedRow = (id: any) => {
  const row = datatable.value.data.find((item) => item.id === id)

  if (!!!row) {
    return ''
  }

  return row?.full_name
}

const handleOnDeletedRecord = async (close) => {
  const response = await handleVuexApiCall(
    service.handleDeleteUser,
    deleteConfirm.value.selected
  )

  if (response.success) {
    notyf.success('Deleted successfully.')
    datatable.value.data = datatable.value.data.filter(
      (each) => each.id !== deleteConfirm.value.selected
    )
    deleteConfirm.value.selected = 0
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  close()
}

onMounted(async () => {
  await paginate()
})

watch(
  () => [search.value],
  (values) => {
    searchRecords()
  }
)
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
      <div class="list-flex-toolbar flex-list-v1">
        <VField>
          <VControl icon="feather:search">
            <input
              v-model="search"
              class="input custom-text-filter"
              placeholder="Search..."
            />
          </VControl>
        </VField>

        <VButtons>
          <RouterLink :to="{ name: 'users-add' }">
            <VButton color="primary" icon="fas fa-plus"> Add User </VButton>
          </RouterLink>
        </VButtons>
      </div>

      <FlexListV1
        :is-loading="isLoading"
        :datatable="datatable"
        :columns="columns"
        @update="onHandleUpdateRecord"
        @delete="onHandleDeleteRecord"
        @paginate="paginate"
      />

      <VModal
        :open="deleteConfirm.visible"
        title="Delete Confirmation"
        size="small"
        actions="right"
        rounded
        @close="deleteConfirm.visible = false"
      >
        <template #content>
          <VPlaceholderSection
            title="Do you want to delete?"
            :subtitle="'Name: ' + getSelectedRow(deleteConfirm.selected)"
          >
          </VPlaceholderSection>
        </template>
        <template #action="{ close }">
          <VButton color="primary" rounded raised @click="handleOnDeletedRecord(close)"
            >Confirm</VButton
          >
        </template>
      </VModal>
    </div>
  </SidebarLayout>
</template>
