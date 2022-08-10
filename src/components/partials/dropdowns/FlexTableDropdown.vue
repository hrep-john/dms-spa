<script setup lang="ts">
const emit = defineEmits(['update', 'delete'])

const updateRecord = () => {
  emit('update')
}

const deleteRecord = () => {
  emit('delete')
}
</script>

<template>
  <VDropdown icon="feather:more-vertical" class="is-pushed-mobile" spaced right>
    <template #content="{ close }">
      <a role="menuitem" class="dropdown-item is-media" @click="updateRecord">
        <div class="icon">
          <i aria-hidden="true" class="fas fa-edit"></i>
        </div>
        <div class="meta">
          <span>Edit</span>
          <span>Edit details</span>
        </div>
      </a>

      <hr class="dropdown-divider" />

      <a role="menuitem" class="dropdown-item is-media" @click="deleteRecord">
        <div class="icon">
          <i aria-hidden="true" class="fas fa-trash"></i>
        </div>
        <div class="meta">
          <span>Delete</span>
          <span>Delete from list</span>
        </div>
      </a>
    </template>
  </VDropdown>
</template>
