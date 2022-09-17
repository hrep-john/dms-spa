<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { doesUserCan } from '/@src/utils/helper'

const props = defineProps({
  document: {
    type: Object,
    default: {},
  },
  showMenu: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'view', 'delete', 'download', 'opened'])

const emitEvent = async (event: any) => {
  emit(event, props.document.id)
}

const dropdown = ref()

watch(
  () => props.showMenu,
  (value) => {
    if (value) {
      dropdown.value.open()
    } else {
      dropdown.value.close()
    }
  }
)
</script>

<template>
  <VDropdown icon="feather:more-vertical" spaced right ref="dropdown">
    <template #content>
      <a
        v-if="doesUserCan('Document: Preview')"
        role="menuitem"
        @click="emitEvent('view')"
        class="dropdown-item is-media"
      >
        <div class="icon">
          <i aria-hidden="true" class="fas fa-eye"></i>
        </div>
        <div class="meta">
          <span>Preview</span>
          <span>Preview this document</span>
        </div>
      </a>
      <hr v-if="doesUserCan('Document: Preview')" class="dropdown-divider" />
      <a
        v-if="doesUserCan('Document: Edit')"
        role="menuitem"
        @click="emitEvent('edit')"
        class="dropdown-item is-media"
      >
        <div class="icon">
          <i aria-hidden="true" class="fas fa-edit"></i>
        </div>
        <div class="meta">
          <span>Edit</span>
          <span>Edit document details</span>
        </div>
      </a>
      <hr v-if="doesUserCan('Document: Edit')" class="dropdown-divider" />
      <a
        v-if="doesUserCan('Document: Download')"
        role="menuitem"
        @click="emitEvent('download')"
        class="dropdown-item is-media"
      >
        <div class="icon">
          <i aria-hidden="true" class="fas fa-download"></i>
        </div>
        <div class="meta">
          <span>Download</span>
          <span>Download this document</span>
        </div>
      </a>
      <hr v-if="doesUserCan('Document: Download')" class="dropdown-divider" />
      <a
        v-if="doesUserCan('Document: Delete')"
        role="menuitem"
        @click="emitEvent('delete')"
        class="dropdown-item is-media"
      >
        <div class="icon">
          <i aria-hidden="true" class="fas fa-trash"></i>
        </div>
        <div class="meta">
          <span>Delete</span>
          <span>Delete this document</span>
        </div>
      </a>
    </template>
  </VDropdown>
</template>