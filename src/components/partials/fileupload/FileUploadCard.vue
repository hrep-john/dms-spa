<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['add', 'remove', 'selected'])

const isUploading = ref(false)

const props = defineProps({
  data: {
    type: Object,
    default: {
      label: null,
      value: null,
      key: null,
    },
  },
})

const data = computed(() => {
  return props.data
})

const onAddFile = (error: any, file: any) => {
  emit('add', {
    error,
    file,
  })
}

const onRemoveFile = (error: any, file: any) => {
  emit('add', {
    error,
    file,
  })
}
</script>

<template>
  <VCard radius="small">
    <div class="image-upload-wrapper">
      <h3 class="title is-6 is-narrow">{{ data.label }}</h3>
      <VAvatar size="xl">
        <template #avatar>
          <img
            v-if="!isUploading"
            class="avatar"
            :src="data.value"
            alt=""
            @error.once="(event) => onceImageErrored(event, '150x150')"
          />
          <VFilePond
            v-else
            class="profile-filepond"
            name="profile_filepond"
            :chunk-retry-delays="[500, 1000, 3000]"
            label-idle="<i class='lnil lnil-cloud-upload'></i>"
            :accepted-file-types="['image/png', 'image/jpeg', 'image/gif']"
            :image-preview-height="140"
            :image-resize-target-width="140"
            :image-resize-target-height="140"
            image-crop-aspect-ratio="1:1"
            style-panel-layout="compact circle"
            style-load-indicator-position="center bottom"
            style-progress-indicator-position="right bottom"
            style-button-remove-item-position="left bottom"
            style-button-process-item-position="right bottom"
            @click="emit('selected', data.key)"
            @addfile="onAddFile"
            @removefile="onRemoveFile"
          />
          <VIconButton
            v-if="!isUploading"
            icon="feather:edit-2"
            class="edit-button is-edit"
            circle
            tabindex="0"
            @keydown.space.prevent="isUploading = true"
            @click="isUploading = true"
          />
          <VIconButton
            v-else
            icon="feather:arrow-left"
            class="edit-button is-back"
            circle
            tabindex="0"
            @keydown.space.prevent="isUploading = false"
            @click="isUploading = false"
          />
        </template>
      </VAvatar>
    </div>
  </VCard>
</template>

<style lang="scss" scoped>
.image-upload-wrapper {
  display: flex;
  align-items: center;

  .title {
    width: 100%;
  }

  .v-avatar {
    img.avatar {
      border: 1px solid var(--dark-dark-text);
    }
  }
}
</style>
