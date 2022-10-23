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
import { handleVuexApiCall, doesUserCan, toDateString } from '/@src/utils/helper'
import { useFilter } from '/@src/stores/filter'
import UdfEnum from '/@src/enums/udf'
import udfServices from '/@src/stores/udfs'
import ModuleEnum from '/@src/enums/module'
import moment from 'moment'

useHead({
  title: `Custom Report | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
const filtermixins = useFilter()
viewWrapper.setPageTitle('')

const service = customReportService.actions
const udfService = udfServices.actions

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
const references = ref({
  filters: [],
})

const fetchCustomReport = async (page = 1) => {
  isLoading.value = true
  console.log('currentRoute.value.params.slug', currentRoute.value.params.slug)

  const payload = {
    page: page,
    per_page: 10,
    filters: buildFilters(),
    slug: currentRoute.value.params.slug,
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
    filters.value.options = initializeFilters(
      JSON.parse(JSON.parse(info.value.format).filters)
    )
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const initializeFilters = (filters: any) => {
  filters.forEach((filter) => {
    if (filter.type === 'dropdown') {
      const options = references.value.filters.find(
        (referenceFilter) => referenceFilter.column === filter.column
      )?.options
      filter.options = options
    }
  })

  return filters
}

const initializeFilterOptions = async (initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  isLoading.value = true

  const payload: any = {
    filters: [
      {
        column: 'entitable_type',
        operator: '=',
        join: 'OR',
        value: ModuleEnum.Document,
      },
    ],
  }

  const response = await handleVuexApiCall(udfService.handleGetUdfs, payload)

  isLoading.value = false

  if (response.success) {
    formatUdfResults(response.data.results.data)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const formatUdfResults = (udfData: any) => {
  let formatted: any = []

  if (udfData.length > 0) {
    udfData.forEach((udf: any) => {
      let field = {}

      if (udf.type == UdfEnum.Types.Text.value) {
        field = {
          column: udf.key,
          name: udf.label,
          type: 'string',
        }
      } else if (udf.type == UdfEnum.Types.Number.value) {
        field = {
          column: udf.key,
          name: udf.label,
          type: 'number',
        }
      } else if (udf.type == UdfEnum.Types.Dropdown.value) {
        field = {
          column: udf.key,
          name: udf.label,
          type: 'dropdown',
          options: udf.settings.options.map((option: any) => option.label),
          raw_options: udf.settings.options,
        }
      } else if (udf.type == UdfEnum.Types.Date.value) {
        field = {
          column: udf.key,
          name: udf.label,
          type: 'date',
        }
      }

      formatted.push(field)
    })
  }

  references.value.filters = filters.value.options.concat(formatted)
}

const buildColumnSettings = (columnSettings: any) => {
  let rebuildColumnSettings = {}

  columnSettings.forEach((settings) => {
    rebuildColumnSettings[settings.field] = settings.label
  })

  return rebuildColumnSettings
}

const buildFilters = () => {
  const columns = filters.value.options.map((filterOption) => filterOption.column)
  let criteria: any = []

  columns.forEach((column) => {
    if (search.value != '') {
      criteria.push({
        field: column,
        join: 'or',
        operator: 'LIKE',
        value: `%${search.value}%`,
      })
    }
  })

  const clone = JSON.parse(JSON.stringify(filtermixins.getFilterDropdownData()))

  let filterDropdownData = formatFilterValues(clone)

  criteria = criteria.concat(filterDropdownData)

  return criteria
}

const formatFilterValues = (filters: any) => {
  let formatted: any = []

  filters = filters.forEach((filter) => {
    if (filter.type === 'date' && filter.operator === 'to') {
      const splittedDates = filter.value.split(' ')
      // Deep Clone
      const dateStart = Object.assign({}, filter)
      const dateEnd = Object.assign({}, filter)
      dateStart.value = splittedDates[0]
      dateStart.operator = '>='
      formatted.push(dateStart)
      dateEnd.value = splittedDates[2]
      dateEnd.operator = '<='
      formatted.push(dateEnd)
    } else {
      filter.value = formatFilterRawValue(filter)
      formatted.push(filter)
    }
  })

  return formatted
}

const formatFilterRawValue = (filter: any) => {
  let value = filter.value

  if (filter.type !== 'date') {
    value = value.slice(1, -1)
  }

  if (filter.type === 'dropdown') {
    const referenceFilter: any = references.value.filters.find(
      (referenceFilter) => referenceFilter.column === filter.field
    )

    const rawOptions = referenceFilter.raw_options

    value = rawOptions.find((option) => option.label === value)?.id
  }

  return value
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
  const date = moment().format('MMMM D, YYYY')

  viewWrapper.setPrintoutTemplate({
    headers: {
      first_line: 'Legal Affairs Department',
      second_line: info.value.name,
      third_line: date,
    },
    filters: buildFilters(),
  })

  const slug = currentRoute.value.params.slug

  window.open(`${slug}/print`, '_blank')
}

const formatFilterItemLabel = (filterItem: any) => {
  let { label, operator, value, type } = filterItem

  if (type === 'date') {
    if (operator === 'to') {
      const splittedDates = value.split(' ')
      const start = toDateString(splittedDates[0])
      const end = toDateString(splittedDates[2])
      value = `${start} ${operator} ${end}`
      operator = 'from '
    } else {
      value = toDateString(value)
    }
  }

  return `${label} ${operator} ${value}`
}

const currentRoute = computed(() => {
  return router.currentRoute.value
})

const currentRoutePath = computed(() => {
  return router.currentRoute.value.path
})

onMounted(async () => {
  await initializeFilterOptions(true)
  await fetchCustomReport()
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

watch(
  () => currentRoutePath.value,
  async (value) => {
    if (value && typeof value === 'string' && value.startsWith('/custom-reports/')) {
      clearRecords()
      filtermixins.clearFilterDropdownData()
      await fetchCustomReport()
    }
  }
)

onBeforeUnmount(() => {
  filtermixins.setFilterDropdownItem([])
})
</script>

<template>
  <SidebarLayout default-sidebar="reports" open-on-mounted>
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
              <VTag :label="formatFilterItemLabel(filterItem)" color="primary" />
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