<route lang="yaml">
meta:
  rolesAllowed:
    - superadmin
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
import tenantService from '/@src/stores/tenants'
import debounce from 'lodash.debounce'
import { useRouter } from 'vue-router'
import { handleVuexApiCall } from '/@src/utils/helper'

useHead({
  title: `Tenant List - ${import.meta.env.VITE_PROJECT_NAME}`,
})

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Tenant List')

const service = tenantService.actions

const isLoading = ref(true)
const search = ref('')
const datatable = ref({ data: [], meta: {} })
const page = ref(1)
const deleteConfirm = ref({ visible: false, selected: 0 })

const columns = {
  domain: 'Domain',
  name: 'Name',
  created_at: 'Date Created',
  updated_at: 'Last Updated',
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

  const response = await handleVuexApiCall(service.handleGetTenants, payload)

  isLoading.value = false

  if (response.success) {
    const formatted = formatData(response.data.results.data)
    datatable.value.data = datatable.value.data.concat(formatted)
    datatable.value.meta = response.data.results.meta
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const buildFilters = () => {
  const columns = ['domain', 'name']
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
    formatted.push({
      id: data[i].id,
      domain: data[i].domain,
      name: data[i].name,
      created_at: data[i].created_at,
      updated_at: data[i].updated_at,
    })
  }

  return formatted
}

const searchRecords = debounce(() => {
  clearRecords()
  paginate()
}, 500)

const clearRecords = () => {
  datatable.value.data = []
  datatable.value.meta = {}
  page.value = 1
}

const updateRecord = (id: any) => {
  router.push(`/tenants/${id}/edit`)
}

const deleteRecord = (id: any) => {
  deleteConfirm.value.visible = true
  deleteConfirm.value.selected = id
}

const isLastPage = computed(() => {
  if (!datatable.value.hasOwnProperty('meta')) {
    return true
  }

  return datatable.value.meta.current_page >= datatable.value.meta.last_page
})

const loadMore = () => {
  paginate(++page.value)
}

const getSelectedRow = (id: any) => {
  const row = datatable.value.data.find((item) => item.id === id)

  if (!!!row) {
    return ''
  }

  return row?.name
}

const handleOnDeletedRecord = async (close: Function) => {
  const response = await handleVuexApiCall(
    service.handleDeleteTenant,
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

onMounted(() => {
  setTimeout(function () {
    paginate()
  }, 200)
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
          <RouterLink :to="{ name: 'tenants-add' }">
            <VButton color="primary" icon="fas fa-plus"> Add Tenant </VButton>
          </RouterLink>
        </VButtons>
      </div>

      <FlexListV1
        :is-loading="isLoading"
        :datatable="datatable"
        :columns="columns"
        @update="updateRecord"
        @delete="deleteRecord"
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
