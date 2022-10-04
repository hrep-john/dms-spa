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
import { onMounted, onBeforeUnmount, ref, computed, watch, onBeforeMount } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import customReportService from '/@src/stores/customReports'
import debounce from 'lodash.debounce'
import { useRouter } from 'vue-router'
import { handleVuexApiCall, doesUserCan } from '/@src/utils/helper'
import { useFilter } from '/@src/stores/filter'
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

const date = ref('')

const fetchCustomReport = async (page = 1) => {
  isLoading.value = true

  const payload = {
    page: page,
    per_page: 10,
    filters: buildFilters(),
    slug: routeParams.slug,
  }

  const response = await handleVuexApiCall(service.handleShowCustomReport, payload)

  isLoading.value = false

  if (response.success) {
    const formatted = formatData(response.data.results.data)
    const currentMeta = datatable.value.meta

    datatable.value.data = datatable.value.data.concat(formatted)
    datatable.value.meta = response.data.results.meta
    info.value = response.data.results.info
    viewWrapper.setPageTitle(info.value.name)
    document.title = `${info.value.name} | ${import.meta.env.VITE_PROJECT_NAME}`
    columnSettings.value = buildColumnSettings(
      JSON.parse(JSON.parse(info.value.format).column_settings)
    )
    filters.value.options = JSON.parse(JSON.parse(info.value.format).filters)

    if (currentMeta.current_page !== datatable.value.meta.last_page) {
      loadMore()
    } else {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
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
  let filters = []

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

  filters = filtermixins.getFilterDropdownData()

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

onBeforeMount(() => {
  notyf.dismissAll()
})

onMounted(async () => {
  date.value = moment().format('MMMM D, YYYY')
  await fetchCustomReport()

  window.onafterprint = () => {
    window.close()
  }
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
  <!-- <SidebarLayout default-sidebar="reports"> -->
  <!-- Content Wrapper -->
  <VLoader size="xl" v-show="isLoading" :active="true" class="h-screen" />

  <div class="page-content-inner print">
    <!--
          Page content goes here

          You can see pages content samples from 
          files in /src/components/pages directory
        -->

    <header>
      <img class="logo" :src="'/images/logos/hrep-logo.png'" alt="" />
      <h3>Legal Affairs Department</h3>
      <h3 class="is-bold">DOCUMENTS PROCESSED</h3>
      <h3>{{ date }}</h3>
    </header>

    <table v-if="datatable.data.length > 0" class="table is-striped is-fullwidth mt-2">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th v-for="(column, key) in columnSettings" :key="key" scope="col">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(list, listKey) in datatable.data" :key="listKey">
          <td>{{ listKey + 1 }}</td>
          <td v-for="(column, key) in columnSettings" :key="key">{{ list[key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
.h-screen {
  height: 100vh;
}

.print {
  background-color: var(--white);

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;

    img.logo {
      width: 60px;
      height: 60px;
    }
  }

  .filters {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;

    .title {
      margin-top: 0.4rem;
    }
  }
}
</style>