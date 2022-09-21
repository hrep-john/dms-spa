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
import { onMounted, ref, computed, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import customReportService from '/@src/stores/customReports'
import debounce from 'lodash.debounce'
import { useRouter } from 'vue-router'
import { handleVuexApiCall, doesUserCan } from '/@src/utils/helper'

useHead({
  title: `Custom Report | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('')

const service = customReportService.actions

const isLoading = ref(true)
const search = ref('')
const datatable = ref({ data: [], meta: {} })
const page = ref(1)
const routeParams = router.currentRoute.value.params
const info = ref({})
const columnSettings = ref({})

const fetchCustomReport = async (page = 1) => {
  isLoading.value = true

  const payload = {
    page: page,
    per_page: 10,
    filters: buildFilters(),
    slug: routeParams.slug,
  }

  const response = await handleVuexApiCall(service.handleShowCustomReport, payload)

  if (response.success) {
    const formatted = formatData(response.data.results.data)
    datatable.value.data = datatable.value.data.concat(formatted)
    datatable.value.meta = response.data.results.meta
    info.value = response.data.results.info
    viewWrapper.setPageTitle(info.value.name)
    document.title = `${info.value.name} | ${import.meta.env.VITE_PROJECT_NAME}`
    columnSettings.value = JSON.parse(JSON.parse(info.value.format).column_settings)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const buildFilters = () => {
  const columns = ['name', 'updated_at']
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
  return data
}

const searchRecords = debounce(async () => {
  await clearRecords()
  await fetchCustomReport()
}, 500)

const clearRecords = async () => {
  datatable.value.data = []
  datatable.value.meta = {}
  page.value = 1
}

const isLastPage = computed(() => {
  if (!datatable.value.hasOwnProperty('meta')) {
    return true
  }

  return datatable.value.meta.current_page >= datatable.value.meta.last_page
})

const loadMore = async () => {
  await fetchCustomReport(++page.value)
}

const getSelectedRow = (id: any) => {
  const row = datatable.value.data.find((item) => item.id === id)

  if (!!!row) {
    return ''
  }

  return row?.name
}

onMounted(() => {
  fetchCustomReport()
})

watch(
  () => [search.value],
  (values) => {
    searchRecords()
  }
)
</script>

<template>
  <SidebarLayout default-sidebar="reports">
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
          <RouterLink :to="{ name: 'report-builders-add' }">
            <VButton color="info" icon="fas fa-print"> Print </VButton>
          </RouterLink>
        </VButtons>
      </div>

      <FlexPaginationList
        :is-loading="isLoading"
        :datatable="datatable"
        :columns="columnSettings"
        @paginate="fetchCustomReport"
      />
    </div>
  </SidebarLayout>
</template>
