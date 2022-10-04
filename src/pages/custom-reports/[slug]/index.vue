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
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import customReportService from '/@src/stores/customReports'
import debounce from 'lodash.debounce'
import { useRouter } from 'vue-router'
import { handleVuexApiCall, doesUserCan } from '/@src/utils/helper'
import { useFilter } from '/@src/stores/filter'

useHead({
  title: `Custom Report | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
const filtermixins = useFilter()
viewWrapper.setPageTitle('')

const service = customReportService.actions

const isLoading = ref(true)
const search = ref('')
const datatable = ref({ data: [], meta: {} })
const page = ref(1)
const routeParams = router.currentRoute.value.params
const info = ref({})
const columnSettings = ref({})
const filters = ref({
  options: [],
})

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
    columnSettings.value = buildColumnSettings(
      JSON.parse(JSON.parse(info.value.format).column_settings)
    )
    filters.value.options = JSON.parse(JSON.parse(info.value.format).filters)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const buildColumnSettings = (columnSettings: any) => {
  let rebuildColumnSettings = {}

  columnSettings.forEach((settings) => {
    rebuildColumnSettings[settings.field] = settings.label
  })

  return rebuildColumnSettings
}

const buildFilters = () => {
  const columns = ['name', 'updated_at']
  let filters: any = []

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

  const clone = JSON.parse(JSON.stringify(filtermixins.getFilterDropdownData()))

  let filterDropdownData = formatFilterValues(clone)

  filters = filters.concat(filterDropdownData)

  return filters
}

const formatFilterValues = (filters: any) => {
  let formatted: any = []
  filters = filters.forEach((filter) => {
    filter.value = filter.value.slice(1, -1)
    formatted.push(filter)
  })

  return formatted

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

const print = () => {
  window.open(`${routeParams.slug}/print`, '_blank')
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

watch(
  () => filtermixins.filterDropdownData,
  (value) => {
    searchRecords(value)
  }
)

onBeforeUnmount(() => {
  filtermixins.setFilterDropdownItem([])
})
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

        <Tippy placement="top">
          <FilterDropdown :filters="filters.options" :right="false" />
          <template #content>
            <div class="v-popover-content is-text">
              <div class="popover-head">
                <h4 class="dark-inverted">Advanced Search</h4>
              </div>
            </div>
          </template>
        </Tippy>

        <VButtons>
          <VButton color="info" icon="fas fa-print" @click="print"> Print </VButton>
        </VButtons>
      </div>

      <div class="filters" v-if="filtermixins.filterDropdownData.length > 0">
        <VField grouped multiline>
          <h4 class="is-6 mr-2 is-narrow title">Filters:</h4>
          <VControl
            v-for="(filterItem, filterItemKey) in filtermixins.filterDropdownData"
            :key="filterItemKey"
          >
            <VTags addons>
              <VTag
                :label="`${filterItem.label} is ${filterItem.value}`"
                color="primary"
              />
              <VTag
                remove
                @click="filtermixins.removeFilterDropdownItem(filterItemKey)"
              />
            </VTags>
          </VControl>
        </VField>
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

<style lang="scss">
.filters {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  .title {
    margin-top: 0.4rem;
  }
}
</style>