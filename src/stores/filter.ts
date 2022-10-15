import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFilter = defineStore('filter', () => {
  const filterData = ref([])
  const filterDropdownData = ref([])

  const sortedFilterDropdownData = computed(() => {
    let sortedFilters = filterDropdownData

    sortedFilters = sortedFilters.value.reduce((group, filter) => {
      const { field } = filter
      group[field] = group[field] ?? []
      group[field].push(filter)
      return group
    }, {})

    return sortedFilters
  })

  function getFormattedFilterDropdownData() {
    let sortedFilters = sortedFilterDropdownData.value
    let outerGroup = []

    Object.keys(sortedFilters).forEach((key) => {
      let innerGroup = sortedFilters[key].map((filter) => {
        let operator = filter.operator === 'to' ? '' : ` ${filter.operator}`
        return `${filter.field} ${operator} ${filter.value}`
      })
      innerGroup = innerGroup.join(' OR ')
      outerGroup.push(`(${innerGroup})`)
    })

    outerGroup = outerGroup.join(' AND ')

    return outerGroup
  }

  function getFilterDropdownData() {
    return filterDropdownData.value
  }

  function setFilterItem(newData: any, index: Number) {
    filterData.value[index] = newData
  }

  function setFilterDropdown(newData: any) {
    filterDropdownData.value = newData
  }

  function setFilterDropdownItem(newData: any) {
    filterDropdownData.value = filterDropdownData.value.concat(newData)
  }

  function removeFilterDropdownItem(index: number) {
    filterDropdownData.value = filterDropdownData.value.filter(
      (filterValue, filterIndex) => filterIndex !== index
    )
  }

  function clearFilterDropdownData() {
    filterDropdownData.value = []
  }

  return {
    filterData,
    filterDropdownData,
    setFilterDropdown,
    setFilterItem,
    setFilterDropdownItem,
    removeFilterDropdownItem,
    sortedFilterDropdownData,
    getFormattedFilterDropdownData,
    getFilterDropdownData,
    clearFilterDropdownData,
  } as const
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilter, import.meta.hot))
}
