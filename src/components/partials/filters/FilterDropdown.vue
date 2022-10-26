<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useFilter } from '/@src/stores/filter'
import { useNotyf } from '/@src/composable/useNotyf'

const props = defineProps({
  filters: {
    type: Array,
    default: [],
  },
  right: {
    type: Boolean,
    default: true,
  },
})

const notyf = useNotyf()
const filtermixins = useFilter()

const emit = defineEmits(['close'])

const dropdown = ref(null)

const selectedField = ref(null)
const selectedValue = ref(null)
const selectedOperator = ref(null)

const fields = () => {
  const fields = {}

  props.filters.forEach((filter) => {
    fields[filter.column] = filter.name
  })

  return fields
}

const operators = computed(() => {
  let operators = {}

  props.filters.forEach((filter) => {
    if (filter.type === 'string') {
      operators[filter.column] = {
        '=': 'equals',
        '!=': 'not equals',
      }
    } else if (filter.type === 'date') {
      operators[filter.column] = {
        '=': 'equals',
        '!=': 'not equals',
        to: 'date range',
      }
    } else {
      operators[filter.column] = {
        '=': 'equals',
        '!=': 'not equals',
        '>=': 'greater than or equal',
        '>': 'greater than',
        '>=': 'less than or equal',
        '>': 'less than',
      }
    }
  })

  return selectedField.value === null
    ? ['=', '>=', '>', '<=', '<', '!=']
    : operators[selectedField.value]
})

const onChangeFieldHandler = () => {
  selectedOperator.value = null
}

const getSelectedFilter = () => {
  const selectedFilter = props.filters.find(
    (filter) => filter.column === selectedField.value
  )

  return selectedFilter
}

const handleOnChangeFilter = (value: any) => {
  selectedValue.value = value
}

const onAddFilterItem = () => {
  const selectedFilter = props.filters.find(
    (filter) => filter.column === selectedField.value
  )

  let value = `\"${selectedValue.value}\"`

  if (selectedFilter.type === 'date') {
    if (selectedOperator.value === 'to') {
      value = `${selectedValue.value.start} TO ${selectedValue.value.end}`
    } else {
      value = `${selectedValue.value}`
    }
  }

  const filter = {
    field: selectedField.value,
    label: selectedFilter.name,
    type: selectedFilter.type,
    join: selectedFilter.join,
    operator: selectedOperator.value,
    value,
  }

  filtermixins.setFilterDropdownItem(filter)

  // Increment counter to re-render and reset the component data
  counter.value++
  selectedField.value = null
  selectedOperator.value = null
  selectedValue.value = null
  dropdown.value.close()
}

const counter = ref(0)

onMounted(() => {})
</script>

<template>
  <VDropdown class="filter-dropdown" :class="{ 'is-right': props.right }" ref="dropdown">
    <template #button="{ toggle }">
      <VButton color="primary-grey" @click="toggle" raised bordered fullwidth>
        <span class="icon">
          <i aria-hidden="true" class="fas fa-filter"></i>
        </span>
        <span>Filter</span>
      </VButton>
    </template>

    <template #content="{ close }">
      <div>
        <div class="columns is-multiline">
          <div class="column is-12">
            <label> Field: </label>

            <Multiselect
              :options="fields()"
              :searchable="true"
              v-model="selectedField"
              @change="onChangeFieldHandler"
              placeholder="Select a field"
            />
          </div>

          <div class="column is-12">
            <label> Operator: </label>

            <Multiselect
              :options="operators"
              :searchable="true"
              :disabled="selectedField === null"
              v-model="selectedOperator"
              placeholder="Select a operator"
            />
          </div>

          <!-- VALUE PLACEHOLDER -->
          <div class="column is-12" v-show="selectedField === null">
            <label> Value: </label>
            <input
              type="text"
              class="input"
              placeholder="Please select field first.."
              :disabled="true"
            />
          </div>

          <div
            v-for="(filter, key) in props.filters"
            :key="key"
            v-show="filter.column === selectedField"
            class="column is-12"
          >
            <label> Value: </label>
            <FilterDropdownItem
              :filter="filter"
              :filter-key="key"
              :selected-operator="selectedOperator"
              :key="`${key}__${counter}`"
              @search="onAddFilterItem"
              @change="handleOnChangeFilter"
            />
          </div>

          <div class="column is-12">
            <VButton
              color="primary"
              class="has-fullwidth mb-2"
              raised
              @click="onAddFilterItem"
              :disabled="
                selectedField === null ||
                selectedOperator === null ||
                selectedValue === null ||
                selectedValue === ''
              "
            >
              <span class="icon">
                <i aria-hidden="true" class="fas fa-plus"></i>
              </span>
              <span>Add</span>
            </VButton>

            <VButton color="light" class="has-fullwidth" raised @click="close">
              <span class="icon">
                <i aria-hidden="true" class="fas fa-times"></i>
              </span>
              <span>Close</span>
            </VButton>
          </div>
        </div>
      </div>
    </template>
  </VDropdown>
</template>

<style lang="scss">
.filter-dropdown {
  .dropdown-menu {
    width: 230px;

    .dropdown-content {
      padding: 1rem;
    }
  }
}
</style>