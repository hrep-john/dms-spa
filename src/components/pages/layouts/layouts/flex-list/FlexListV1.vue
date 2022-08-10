<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  datatable: {
    type: Object,
    default: {
      data: [],
      meta: {},
    },
  },
  columns: {
    type: Object,
    default: {
      actions: '',
    },
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update', 'delete', 'paginate'])

const page = computed(() => {
  return datatable.value.meta.current_page
})

const datatable = computed(() => {
  return props.datatable
})

const columns = computed(() => {
  return {
    index: '#',
    ...props.columns,
  }
})

const filteredColumns = computed(() => {
  const { actions, ...newData } = props.columns
  return newData
})

const onClickUpdate = (id: any) => {
  emit('update', id)
}

const onClickDelete = (id: any) => {
  emit('delete', id)
}

const isLastPage = computed(() => {
  if (!datatable.value.hasOwnProperty('meta')) {
    return true
  }

  return datatable.value.meta.current_page >= datatable.value.meta.last_page
})

const loadMore = () => {
  emit('paginate', page.value + 1)
}

// watch(
//   () => [page.value],
//   (values) => {
//     emit('paginate', page.value)
//   }
// )
</script>

<template>
  <div>
    <div class="page-content-inner">
      <div class="flex-list-wrapper flex-list-v1">
        <!-- Placeloader -->
        <PlaceloadV2 v-show="props.isLoading" :columns="props.columns" />

        <!--List Empty Search Placeholder -->
        <VPlaceholderPage
          v-if="!isLoading && datatable.data.length === 0"
          title="We couldn't find any matching results."
          subtitle="Too bad. Looks like we couldn't find any matching results for the
          search terms you've entered. Please try different search terms or
          criteria."
          larger
        >
          <template #image>
            <img
              class="light-image"
              src="/@src/assets/illustrations/placeholders/search-4.svg"
              alt=""
            />
            <img
              class="dark-image"
              src="/@src/assets/illustrations/placeholders/search-4-dark.svg"
              alt=""
            />
          </template>
        </VPlaceholderPage>

        <!-- Table -->
        <VFlexTable
          v-if="datatable.data.length"
          v-show="!props.isLoading"
          :data="datatable.data"
          :columns="columns"
          :clickable="true"
          :rounded="true"
        >
          <template #body>
            <TransitionGroup name="list" tag="div" class="flex-list-inner">
              <!--Table item-->
              <div
                v-for="(item, index) in datatable.data"
                :key="index"
                class="flex-table-item cursor-pointer"
                @dblclick="onClickUpdate(item.id)"
              >
                <VFlexTableCell :column="{ align: 'start' }">
                  <span class="light-text"> {{ index + 1 }} </span>
                </VFlexTableCell>
                <VFlexTableCell v-for="(column, key) in filteredColumns" :key="key">
                  <span class="light-text">{{ item[key] }}</span>
                </VFlexTableCell>
                <VFlexTableCell :column="{ align: 'end' }">
                  <FlexTableDropdown
                    @update="onClickUpdate(item.id)"
                    @delete="onClickDelete(item.id)"
                  />
                </VFlexTableCell>
              </div>
            </TransitionGroup>
          </template>
        </VFlexTable>
      </div>

      <!-- Load More Button -->
      <VFlex justify-content="center" class="mt-6">
        <VButton
          color="primary"
          raised
          v-show="!props.isLoading && !isLastPage"
          @click="loadMore"
        >
          Load More
        </VButton>
      </VFlex>
    </div>
  </div>
</template>

<style lang="scss">
.has-top-nav {
  .flex-list-wrapper,
  .list-flex-toolbar {
    max-width: 880px;
    margin-right: auto;
    margin-left: auto;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.flex-table {
  .flex-table-header {
    span:first-child {
      max-width: 100px;
    }
  }
  .flex-table-item {
    .flex-table-cell:first-child {
      max-width: 100px;
    }
  }
}

.flex-table {
  .flex-table-header span:first-child,
  .flex-table-item .flex-table-cell:first-child {
    max-width: 70px;
  }
}
</style>
