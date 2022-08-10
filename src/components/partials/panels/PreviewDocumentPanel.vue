<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePanels } from '/@src/stores/panels'
import { onceImageErrored } from '/@src/utils/via-placeholder'

type TabId = 'details' | 'preview'

const panels = usePanels()
const activeTab = ref<TabId>('details')
const showPanel = ref(false)

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },

  udfs: {
    type: Array,
    default: [],
  },
})

const isImage = (filetype: string) => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(filetype)
}

const formatFilePreviewUrl = (url: string) => {
  const link = `https://docs.google.com/gview?url=${url}&embedded=true`
  return link
}

const withPreview = () => {
  const allowedExtensions = [
    'jpg',
    'jpeg',
    'png',
    'doc',
    'docx',
    'pdf',
    'csv',
    'xlsx',
    'pptx',
    'txt',
  ]
  return allowedExtensions.includes(props.data.extension)
}

const udfs = computed(() => {
  let udfValues = props?.data?.udfs
  let udfs = props?.udfs

  if (!udfValues) {
    return []
  }

  udfs.forEach((udf) => {
    udf.value = udfValues[udf?.key] || ''
  })

  return udfs
})

const requiredFields = computed(() => {
  return [
    {
      label: 'File Name',
      value: props?.data?.filename,
    },
    {
      label: 'File Type',
      value: props?.data?.extension,
    },
    {
      label: 'Created By',
      value: props?.data?.created_by,
    },
    {
      label: 'Date Created',
      value: props?.data?.created_at,
    },
    {
      label: 'Updated By',
      value: props?.data?.updated_by,
    },
    {
      label: 'Last Modified',
      value: props?.data?.updated_at,
    },
  ]
})

watch(
  () => panels.active,
  (value) => {
    document.documentElement.style.overflow = value !== 'none' ? 'hidden' : ''
    showPanel.value = value !== 'none'
  }
)
</script>

<template>
  <div
    v-if="panels.active"
    id="activity-panel"
    :class="[panels.active === 'preview-document' && 'is-active']"
    class="right-panel-wrapper is-preview-document"
  >
    <div
      class="panel-overlay"
      tabindex="0"
      @keydown.space.prevent="panels.close()"
      @click="panels.close()"
    ></div>

    <div class="right-panel">
      <div class="right-panel-head">
        <h3>View Document</h3>
        <a
          class="close-panel"
          tabindex="0"
          @keydown.space.prevent="panels.close()"
          @click="panels.close()"
        >
          <i aria-hidden="true" class="iconify" data-icon="feather:chevron-right"></i>
        </a>
      </div>
      <div class="tabs-wrapper">
        <!-- details -->
        <div class="details">
          <div class="columns is-multiline">
            <div v-for="(field, key) in requiredFields" :key="key" class="column is-6">
              <h3 class="subtitle is-narrow is-6">{{ field.label }}</h3>
              <p class="">{{ field.value }}</p>
            </div>
            <div v-for="(udf, key) in udfs" :key="key" class="column is-6">
              <h3 class="subtitle is-narrow is-6">{{ udf.label }}</h3>
              <p class="">{{ udf.value }}</p>
            </div>
          </div>
        </div>

        <!-- preview -->
        <div
          class="preview"
          :class="{ 'has-fullheight': !isImage(props?.data?.extension) }"
        >
          <img
            v-if="isImage(props?.data?.extension)"
            :src="props?.data?.url || ''"
            alt="preview-image"
            class="has-fullwidth"
          />
          <iframe
            v-else-if="['pdf', 'txt'].includes(props?.data?.extension)"
            :src="props?.data?.url"
            class="has-fullwidth has-fullheight"
          />
          <iframe
            v-else
            :src="formatFilePreviewUrl(props?.data?.url)"
            :key="props?.data?.id"
            class="has-fullwidth has-fullheight"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../../scss/abstracts/mixins';

.right-panel-wrapper {
  &.is-preview-document {
    .right-panel {
      .right-panel-head {
        padding: 0 30px;
      }

      .right-panel-body {
        padding: 0 30px;
        height: calc(100% - 55px);

        .tab-content {
          height: 100%;
          padding-bottom: 2rem;
        }
      }

      .tabs-wrapper {
        height: calc(100% - 60px);
        padding-bottom: 3rem;
        padding-left: 2rem;
        padding-right: 2rem;
        overflow-y: auto;
        margin-top: 1rem;

        .details {
          margin-bottom: 2rem;
        }
      }
    }
  }
}
</style>
