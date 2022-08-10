<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useFilter } from '/@src/stores/filter'

const props = defineProps({
  filters: {
    type: Array,
    default: [],
  },
  show: {
    type: Boolean,
    default: false,
  },
})

const filtermixins = useFilter()

const emit = defineEmits(['search', 'close'])

const included = ref([])

onMounted(() => {
  loadDefault()
})

const loadDefault = () => {
  included.value = []

  const filters = props.filters

  for (let index in filters) {
    let defaults = null

    if (filters[index].default !== undefined) {
      defaults =
        filters[index].default.length === undefined
          ? [filters[index].default]
          : filters[index].default
    } else {
      defaults = ['']
    }

    setFilterItem(defaults, index)

    included.value = included.value.concat(filters[index])
  }
}

const setFilterItem = (defaults: any, index: any) => {
  const filters = props.filters

  for (let i = 0; i < defaults.length; i++) {
    let object = defaults[i]

    const filterItem = {
      column: object && object.column ? object.column : filters[index].column,
      operator: object && object.comparison ? object.comparison : '=',
      value: object && object.value ? object.value : '',
      joinCondition: object && object.join ? object.join : 'AND',
    }

    filtermixins.setFilterItem(filterItem, index)
  }
}

const search = () => {
  emit('search')
  emit('close', false)
}

watch(
  () => [props.filters],
  (values) => {
    loadDefault()
  }
)
</script>

<template>
  <VModal
    :open="show"
    title="Search Filters"
    size="medium"
    actions="right"
    @close="emit('close', false)"
  >
    <template #content>
      <form class="modal-form columns is-multiline">
        <div v-for="(filter, key) in included" :key="key" class="column is-6">
          <FilterItem class="" :filter="filter" :filter-index="key" @search="search" />
        </div>
      </form>
    </template>

    <template #action>
      <VButton color="primary" raised @click="search">Search</VButton>
    </template>
  </VModal>
</template>