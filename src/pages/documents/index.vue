<route lang="yaml">
meta:
  permissionsAllowed:
    - 'Document: View List'
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
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import { usePanels } from '/@src/stores/panels'
import { useFilter } from '/@src/stores/filter'
import debounce from 'lodash.debounce'
import documentServices from '/@src/stores/documents'
import udfServices from '/@src/stores/udfs'
import ModuleEnum from '/@src/enums/module'
import UdfEnum from '/@src/enums/udf'
import {
  handleVuexApiCall,
  createTempDownloadBtnLink,
  doesUserCan,
} from '/@src/utils/helper'
import { useUserSession } from '/@src/stores/userSession'

useHead({
  title: `Document List | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const userSession = useUserSession()
const panels = usePanels()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
const filtermixins = useFilter()
viewWrapper.setPageTitle('Document List')

const service = documentServices.actions
const udfService = udfServices.actions
const isLoading = ref(false)
const isProcessing = ref(false)
const scrollComponent = ref(null)

const page = ref(1)
const datagrid = ref({ data: [], meta: {} })
const query = ref('')
const options = ref([])
const isSearching = ref(false)
const udfs = ref([])
const filter = ref({
  options: [],
})
const deleteConfirm = ref(false)
const previewDocument = ref(null)
const selectedDocuments = ref([])
const documentsForDeletion = ref([])
const sort = ref({
  selected: 'formatted_updated_at:desc',
  options: [
    {
      field: 'formatted_updated_at:desc',
      label: 'Last Modified (Ascending)',
    },
    {
      field: 'formatted_updated_at:asc',
      label: 'Last Modified (Descending)',
    },
    {
      field: 'file_name:asc',
      label: 'File Name (Ascending)',
    },
    {
      field: 'file_name:desc',
      label: 'File Name (Descending)',
    },
    {
      field: 'file_size:asc',
      label: 'File Size (Ascending)',
    },
    {
      field: 'file_size:desc',
      label: 'File Size (Descending)',
    },
  ],
})

const user = computed(() => {
  if (userSession.user === undefined) {
    return {}
  }

  return JSON.parse(userSession.user || '')
})

const buildFilters = () => {
  const tenantFilter = `(tenant_id = ${user.value.tenant_id})`
  const operator = filtermixins.filterDropdownData.length > 0 ? ' AND ' : ''
  return `${tenantFilter}${operator}${filtermixins.getFormattedFilterDropdownData()}`
}

const paginate = async (page = 1, initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const filters = buildFilters()

  const payload = {
    page: page,
    per_page: 10,
    q: query.value.input,
    filter: filters,
    sort: sort.value.selected,
  }

  const response = await handleVuexApiCall(service.handleSearchDocuments, payload)

  if (response.success) {
    datagrid.value.data = datagrid.value.data.concat(response.data.results.data)
    datagrid.value.meta = response.data.results.meta
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const formatErrors = (errors: any) => {
  const errorLists = []

  for (let item in errors) {
    for (let i = 0; i < errors[item].length; i++) {
      errorLists.push(errors[item][i])
    }
  }

  return errorLists
}

const clearRecords = () => {
  datagrid.value.data = []
  datagrid.value.meta = {}
  page.value = 1
}

const loadMore = () => {
  if (!isLoading.value && !isLastPage.value && datagrid.value.data.length > 0) {
    paginate(++page.value)
  }
}

const getFilterName = (field: string) => {
  return filter?.value?.options.find((filter) => filter?.column === field)?.name
}

const filterItems = computed(() => {
  let sortedFilters = filtermixins.sortedFilterDropdownData
  let outerGroup = []

  Object.keys(sortedFilters).forEach((key) => {
    let innerGroup = sortedFilters[key].map(
      (filter) => `${getFilterName(filter.field)} ${filter.operator} \"${filter.value}\"`
    )
    innerGroup = innerGroup.join(' OR ')
    outerGroup.push(innerGroup)
  })

  return outerGroup
})

const isLastPage = computed(() => {
  if (!datagrid.value.hasOwnProperty('meta')) {
    return true
  }

  return datagrid.value.meta.current_page >= datagrid.value.meta.last_page
})

const deleteDocuments = async () => {
  if (isProcessing.value) {
    return
  }

  deleteConfirm.value = false
  isLoading.value = true

  const payload = {
    ids: documentsForDeletion.value,
  }

  const response = await handleVuexApiCall(service.handleBulkDeleteDocuments, payload)

  if (response.success) {
    notyf.success('Deleted successfully.')
    datagrid.value.data = datagrid.value.data.filter(
      (item) => !documentsForDeletion.value.includes(item.id)
    )
    documentsForDeletion.value = []
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
}

const handleOnSelectedDocuments = (selected: []) => {
  selectedDocuments.value = selected
}

const handleOnPreviewDocument = (id: number) => {
  previewDocument.value = datagrid.value.data.find((document) => document.id === id)

  panels.setActive('preview-document')
}

const getDocumentFileName = (id: number) => {
  const item = datagrid.value.data.find((item) => item.id === id)
  return item.filename || ''
}

const handleOnDeleteDocument = (id: number) => {
  documentsForDeletion.value = [id]

  deleteConfirm.value = true
}

const showDeleteConfirmation = () => {
  if (selectedDocuments.value.length === 0) {
    notyf.error('Please select at least one document.')
    return
  }

  documentsForDeletion.value = selectedDocuments.value

  deleteConfirm.value = true
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  initializeFilterOptions()
  paginate(1, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  filtermixins.setFilterDropdown([])
  fetchSearchAutocomplete.cancel()
})

const handleScroll = (e) => {
  let element = scrollComponent.value
  if (element.getBoundingClientRect().bottom < window.innerHeight) {
    loadMore()
  }
}

const clearSearchRecords = () => {
  options.value = []
}

const handleOnDownloadDocument = async (id: any) => {
  isProcessing.value = true
  const payload = { id: id }
  const response = await handleVuexApiCall(service.handleDownloadDocument, payload)

  if (response.success) {
    setTimeout(() => {
      createTempDownloadBtnLink(response.data.result)
      notyf.success(response.data.message)
      isProcessing.value = false
    }, 500)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const fetchSearchAutocomplete = debounce(async (q: any) => {
  if (!q || isSearching.value) {
    clearSearchRecords()
    return false
  }

  // isSearching.value = true

  // const payload = {
  //   page: page.value,
  //   per_page: 10,
  //   q: q,
  //   attributesToHighlight: '*',
  // }

  // let results = []

  // const response = await handleVuexApiCall(
  //   service.handleDocumentSearchAutocomplete,
  //   payload
  // )

  // if (response.success) {
  //   results = response.data.results
  // } else {
  //   const error = response?.body?.message
  //   notyf.error(error)
  // }

  // options.value = results

  // isSearching.value = false

  // return results
  return []
}, 500)

const onInputEventHandler = (event: any) => {
  query.value.input = event?.input
  fetchSearchAutocomplete(event?.input)
}

const clearSearchValue = () => {
  query.value.input = ''
  onSearchEventHandler(null)
}

const initializeFilterOptions = async (initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  try {
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

    let response = await udfService.handleGetUdfs(payload)

    formatUdfResults(response.results.data)

    isLoading.value = false
  } catch (error) {
    notyf.error(error.response.data.message)
  }
}

const formatUdfResults = (udfData: any) => {
  let formatted: any = []
  let udfLists: any = []

  formatted = [
    {
      column: 'file_extension',
      name: 'File Type',
      type: 'string',
    },
  ]

  if (udfData.length > 0) {
    udfData.forEach((udf: any) => {
      let field = {}

      if (udf.type == UdfEnum.Types.Text.value) {
        field = {
          column: 'formatted_udfs.' + udf.key,
          name: udf.label,
          type: 'string',
        }
      } else if (udf.type == UdfEnum.Types.Number.value) {
        field = {
          column: 'formatted_udfs.' + udf.key,
          name: udf.label,
          type: 'number',
        }
      } else if (udf.type == UdfEnum.Types.Dropdown.value) {
        field = {
          column: 'formatted_udfs.' + udf.key,
          name: udf.label,
          type: 'dropdown',
          options: udf.settings.options,
        }
      } else if (udf.type == UdfEnum.Types.Date.value) {
        field = {
          column: 'formatted_udfs.' + udf.key,
          name: udf.label,
          type: 'date',
        }
      }

      formatted.push(field)
      udfLists.push({
        key: udf.key,
        label: udf.label,
        type: udf.type,
      })
    })
  }

  filter.value.options = filter.value.options.concat(formatted)
  udfs.value = udfLists
}

const onRemoveFilterDropdownItem = (index: number) => {
  filtermixins.removeFilterDropdownItem(index)
}

const onSearchEventHandler = (event: any) => {
  clearRecords()
  clearSearchRecords()
  paginate()
}

const onSortEventHandler = (field: string) => {
  sort.value.selected = field
  onSearchEventHandler(null)
}

const itemProjectionFunction = (data: object) => data.value

const getTotalResults = () => {
  const total = datagrid?.value?.meta?.total ?? null
  return total === null ? 'Results' : `Results (${total})`
}

watch(
  () => filtermixins.filterDropdownData,
  (value) => {
    onSearchEventHandler(value)
  }
)
</script>

<template>
  <SidebarLayout>
    <!-- Content Wrapper -->
    <div class="page-content-inner" ref="scrollComponent">
      <!--
          Page content goes here

          You can see pages content samples from 
          files in /src/components/pages directory
        -->
      <div class="tile-grid-toolbar">
        <div class="left">
          <VControl icon="feather:search">
            <!-- <input
              v-model="search"
              class="input custom-text-filter"
              placeholder="Search..."
            /> -->
            <vue3-simple-typeahead
              id="typeahead_id"
              class="autocomplete"
              placeholder="Search documents..."
              :items="options"
              :minInputLength="0"
              :itemProjection="itemProjectionFunction"
              ref="query"
              @keyup.enter="onSearchEventHandler"
              @selectItem="onSearchEventHandler"
              @onInput="onInputEventHandler"
              @onFocus="onFocusEventHandler"
              @onBlur="onBlurEventHandler"
            >
              <template #list-item-text="slot">
                <VTag color="primary" class="mr-2" :label="slot.item.source" rounded />
                <span v-html="slot.boldMatchText(slot.itemProjection(slot.item))" />
              </template>
            </vue3-simple-typeahead>
          </VControl>

          <Tippy placement="top">
            <VIconBox
              class="radius-25 mr-1"
              color="primary-grey"
              bordered
              @click="clearSearchValue()"
            >
              <i class="fas fa-times"></i>
            </VIconBox>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Clear Search Field</h4>
                </div>
              </div>
            </template>
          </Tippy>

          <Tippy placement="top">
            <VIconBox
              class="radius-25 mr-1"
              color="primary-grey"
              bordered
              @click="onSearchEventHandler()"
            >
              <i class="fas fa-search"></i>
            </VIconBox>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Search</h4>
                </div>
              </div>
            </template>
          </Tippy>

          <Tippy placement="top" v-if="doesUserCan('Document: Delete')">
            <VIconBox
              class="radius-25 mr-1"
              color="primary-grey"
              bordered
              @click="showDeleteConfirmation"
            >
              <i class="fas fa-trash"></i>
            </VIconBox>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Delete Document</h4>
                </div>
              </div>
            </template>
          </Tippy>

          <Tippy placement="top">
            <FilterDropdown :filters="filter.options" />
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Advanced Search</h4>
                </div>
              </div>
            </template>
          </Tippy>

          <!-- <VButton class="radius-25" color="primary" raised>
            <span class="icon">
              <i aria-hidden="true" class="fas fa-search"></i>
            </span>
            <span>Search</span>
          </VButton> -->
        </div>

        <div class="buttons">
          <!-- <VButton color="primary" raised>
            <span class="icon">
              <i aria-hidden="true" class="fas fa-plus"></i>
            </span>
            <span>Add Folder</span>
          </VButton> -->
          <RouterLink :to="{ name: 'documents-add' }">
            <VButton color="primary" raised>
              <span class="icon">
                <i aria-hidden="true" class="fas fa-plus"></i>
              </span>
              <span>Add Documents</span>
            </VButton>
          </RouterLink>
        </div>
      </div>

      <VProgress size="tiny" v-show="isProcessing" />

      <div class="filters" v-if="filtermixins.filterDropdownData.length > 0">
        <VField grouped multiline>
          <h4 class="is-6 mr-2 is-narrow title">Advanced Search</h4>
          <VControl
            v-for="(filterItem, filterItemKey) in filtermixins.filterDropdownData"
            :key="filterItemKey"
          >
            <VTags addons>
              <VTag
                :label="`${filterItem.label} is ${filterItem.value}`"
                color="primary"
                elevated
              />
              <VTag remove @click="onRemoveFilterDropdownItem(filterItemKey)" />
            </VTags>
          </VControl>
        </VField>
      </div>

      <div class="info">
        <div class="left">
          <h4 class="is-6 is-narrow title">
            {{ getTotalResults() }}
          </h4>
        </div>
        <div class="right">
          <VDropdown right>
            <template #button="{ open, toggle }">
              <VButton
                icon="lnir lnir-sort"
                class="is-trigger"
                @mouseenter="open"
                @click="toggle"
              >
                Sort By
              </VButton>
            </template>

            <template #content="{ close }">
              <div @mouseleave="close">
                <a
                  v-for="(option, key) in sort.options"
                  :key="key"
                  class="dropdown-item"
                  :class="{ 'is-active': option.field === sort.selected }"
                  @click="onSortEventHandler(option.field)"
                >
                  {{ option.label }}
                </a>
              </div>
            </template>
          </VDropdown>
        </div>
      </div>

      <PlaceloadV4 v-show="isLoading" :current-rows="datagrid.meta.to" />

      <FilesTilesGrid
        v-show="!isLoading"
        :documents="datagrid.data"
        :udfs="udfs"
        @delete="handleOnDeleteDocument"
        @view="handleOnPreviewDocument"
        @download="handleOnDownloadDocument"
        @selected="handleOnSelectedDocuments"
      />

      <VFlex justify-content="center" class="mt-6">
        <VButton
          color="primary"
          raised
          v-show="!isLoading && !isLastPage && datagrid.data.length > 0"
          @click="loadMore"
        >
          Load More
        </VButton>
      </VFlex>

      <VModal
        :open="deleteConfirm"
        title="Delete Confirmation"
        size="small"
        actions="right"
        rounded
        @close="deleteConfirm = false"
      >
        <template #content>
          <h3>Do you want to delete the following?</h3>
          <ul>
            <li v-for="(id, index) in documentsForDeletion" :key="index">
              {{ getDocumentFileName(id) }}
            </li>
          </ul>
        </template>
        <template #action="{ close }">
          <VButton color="primary" rounded raised @click="deleteDocuments"
            >Confirm</VButton
          >
        </template>
      </VModal>

      <PreviewDocumentPanel :data="previewDocument" :udfs="udfs" />
    </div>
  </SidebarLayout>
</template>

<style lang="scss">
#preview-document {
  .modal-content {
    min-height: 75vh;

    .modal-card {
      height: 100%;

      .inner-content {
        height: 100%;

        ul {
          list-style: disc;
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }
      }
    }

    .section-placeholder {
      padding: unset;
    }
  }
}

.filters {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  .title {
    min-width: 140px;
    margin-top: 0.4rem;
  }
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
