<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'

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
})

const onChangeFilter = (newValue: any) => {
  if (props.filter.type === 'date' && newValue !== null && newValue !== '') {
    newValue = new Date(newValue).toISOString().split('T')[0]
  }

  emit('change', newValue)
}

const onEnter = (event: any) => {
  emit('search')
}

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
      :options="formatDropdownOptions(filter.options)"
      :searchable="true"
      placeholder="Select an option"
    />

    <VDatePicker
      v-if="filter.type == 'date'"
      color="green"
      trim-weeks
      v-model="filterValue"
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