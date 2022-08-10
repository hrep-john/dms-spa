<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useFilter } from '/@src/stores/filter'

const filtermixins = useFilter()
const emit = defineEmits(['search'])
const operator = ref('contains')

const props = defineProps({
  filter: {
    type: Object,
    default: {},
  },
  filterIndex: {
    type: Number,
    default: 0,
  },
})

const onChangeFilter = (newValue: any) => {
  if (props.filter.type === 'date' && newValue !== null && newValue !== '') {
    newValue = new Date(newValue).toISOString().split('T')[0]
  }

  const filterItem = {
    column: props.filter.column,
    value: newValue,
    operator: operator.value,
    joinCondition: 'AND',
  }

  const index = props.filterIndex

  filtermixins.setFilterItem(filterItem, index)
}

const onKeyUpInput = (event: any) => {
  onChangeFilter(event.target.value)
}

const onEnter = (event: any) => {
  emit('search')
}

const filterValue = computed(() => {
  return filtermixins.filterData[props.filterIndex].value
})

const formatDropdownOptions = (options: any) => {
  let formatted: any = {}

  if (!options) {
    return formatted
  }

  for (let i = 0; i < options.length; i++) {
    let id = options[i].id
    let label = options[i].label
    formatted[id] = label
  }

  return formatted
}

const datePicker = ref()

watch(
  () => [datePicker.value],
  (values) => {
    onChangeFilter(datePicker.value)
  }
)
</script>

<template>
  <label> {{ filter.name }}</label>

  <div class="control">
    <input
      type="text"
      class="input"
      v-if="filter.type == 'string'"
      placeholder="Enter text here.."
      :value="filterValue"
      @keyup="onKeyUpInput"
      @keyup.enter="onEnter"
    />

    <Multiselect
      v-if="filter.type == 'dropdown'"
      :value="filterValue"
      @change="onChangeFilter"
      :options="formatDropdownOptions(filter.options)"
      :searchable="true"
      placeholder="Select an option"
    />

    <VDatePicker
      v-if="filter.type == 'date'"
      color="green"
      trim-weeks
      v-model="datePicker"
    >
      <template #default="{ inputValue, inputEvents }">
        <VField>
          <VControl>
            <input class="input" :value="inputValue" v-on="inputEvents" />
          </VControl>
        </VField>
      </template>
    </VDatePicker>
  </div>
</template>