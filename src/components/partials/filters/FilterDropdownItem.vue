<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, reactive, computed, watch } from 'vue'

const emit = defineEmits(['search', 'change'])

const props = defineProps({
  filter: {
    type: Object,
    default: {},
  },
  filterIndex: {
    type: Number,
    default: 0,
  },
  selectedOperator: {
    type: String,
    default: null,
  },
})

const onChangeFilter = (newValue: any) => {
  emit('change', newValue)
}

const onEnter = (event: any) => {
  emit('search')
}

const daterange = ref({
  start: null,
  end: null,
})

const modelConfig = ref({
  type: 'number',
  timeAdjust: '00:00:00',
})

const filterValue = ref(null)

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

watch(
  () => filterValue.value,
  (value) => {
    onChangeFilter(value)
  }
)

watch(
  () => daterange.value,
  (value) => {
    onChangeFilter(value)
  }
)
</script>

<template>
  <div class="control">
    <input
      type="text"
      class="input"
      v-if="filter.type == 'string'"
      placeholder="Enter text here.."
      v-model="filterValue"
      @keyup.enter="onEnter"
    />

    <input
      type="number"
      class="input"
      v-if="filter.type == 'number'"
      placeholder="Enter number here.."
      v-model="filterValue"
      @keyup.enter="onEnter"
    />

    <Multiselect
      v-if="filter.type == 'dropdown'"
      v-model="filterValue"
      :options="filter.options"
      :searchable="true"
      placeholder="Select an option"
    />

    <VDatePicker
      v-if="filter.type == 'date' && props.selectedOperator != 'to'"
      color="green"
      trim-weeks
      v-model="filterValue"
      timezone="UTC"
      :model-config="modelConfig"
    >
      <template #default="{ inputValue, inputEvents }">
        <VField>
          <VControl>
            <input class="input" :value="inputValue" v-on="inputEvents" />
          </VControl>
        </VField>
      </template>
    </VDatePicker>

    <VDatePicker
      v-if="filter.type == 'date' && props.selectedOperator == 'to'"
      v-model="daterange"
      is-range
      color="green"
      trim-weeks
      class="datepicker"
      timezone="UTC"
      :model-config="modelConfig"
    >
      <template #default="{ inputValue, inputEvents }">
        <VField addons>
          <VControl>
            <input class="input" :value="inputValue.start" v-on="inputEvents.start" />
          </VControl>
          <VControl>
            <input class="input" :value="inputValue.end" v-on="inputEvents.end" />
          </VControl>
        </VField>
      </template>
    </VDatePicker>
  </div>
</template>
