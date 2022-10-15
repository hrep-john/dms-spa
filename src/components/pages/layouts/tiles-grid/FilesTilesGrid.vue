<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFilter } from '/@src/stores/filter'

const router = useRouter()

const props = defineProps({
  documents: {
    type: Array,
    default: [],
  },
  udfs: {
    type: Array,
    default: [],
  },
})

const isEmpty = ref(false)
const selectedFiles = ref([])
const currentContextMenu = ref(null)

const emit = defineEmits(['selected', 'delete', 'download', 'view'])

const getFileIconClassName = (extension: string) => `fiv-icon-${extension}`

function formatDocuments(data: any) {
  let formatted = []

  for (let i = 0; i < data.length; i++) {
    formatted[i] = {
      id: data[i].id,
      name: data[i].filename,
      updated: data[i].updated_at,
      size: data[i].size,
      extension: data[i].extension,
      match: data[i].match,
      has_user_metadata: data[i].has_user_metadata,
    }
  }

  return formatted
}

const documents = computed(() => {
  return formatDocuments(props.documents)
})

const editMetadata = (id: number) => {
  router.push(`/documents/${id}/edit`)
}

const handleOnDeleteDocument = (data: any) => {
  emit('delete', data)
}

const handleOnDownloadDocument = (data: any) => {
  emit('download', data)
}

const handleOnPreviewDocument = (data: any) => {
  emit('view', data)
}

const handleOnEditDocument = (data: any) => {
  editMetadata(data)
}

const truncateText = (text: string, extension: string) => {
  return text.length > 100 ? `${text.replace(/(.{95})..+/, '$1…')}${extension}` : text
}

const onSelectedFile = (id: number) => {
  if (selectedFiles.value.includes(id)) {
    selectedFiles.value = selectedFiles.value.filter((selected) => selected !== id)
  } else {
    selectedFiles.value.push(id)
  }

  emit('selected', selectedFiles.value)
}

const isFileSelected = (id: number) => {
  return selectedFiles.value.includes(id)
}

const setCurrentContextMenu = (id: number) => {
  // Added delay effect to reset first
  currentContextMenu.value = null
  setTimeout(() => {
    currentContextMenu.value = id
  }, 50)
}

const getSubjectLabel = (field: string) => {
  let label = ''

  const whitelists = [
    {
      field: 'file_name',
      label: 'File Name',
    },
    {
      field: 'file_extension',
      label: 'File Extension',
    },
    {
      field: 'formatted_detail_metadata',
      label: 'Keyword',
    },
  ]

  whitelists.forEach((whitelist) => {
    if (whitelist.field == field) {
      label = whitelist.label
    }
  })

  if (label === '') {
    label = props.udfs.find((udf) => udf.key === field)?.label
  }

  return label
}

watch(
  () => [props.documents],
  (values) => {
    isEmpty.value = props.documents.length === 0
  }
)
</script>

<template>
  <div>
    <div class="tile-grid tile-grid-v2">
      <!--List Empty Search Placeholder -->
      <VPlaceholderPage
        :class="[!isEmpty && 'is-hidden']"
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

      <!--Tile Grid v1-->
      <TransitionGroup name="list" tag="div" class="columns is-multiline">
        <!--Grid item-->
        <div
          v-for="item in documents"
          :key="item.id"
          class="column is-12"
          @dblclick="editMetadata(item.id)"
          @click="onSelectedFile(item.id)"
          @contextmenu.prevent="setCurrentContextMenu(item.id)"
        >
          <Tippy placement="left">
            <div
              class="status"
              :class="{ 'has-user-metadata': !item.has_user_metadata }"
            ></div>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">No Metadata</h4>
                </div>
              </div>
            </template>
          </Tippy>
          <div class="tile-grid-item" :class="{ 'is-active': isFileSelected(item.id) }">
            <div class="tile-grid-item-inner">
              <span
                class="fiv-viv fiv-size-lg"
                :class="getFileIconClassName(item.extension)"
                @error.once="(event) => onceImageErrored(event, '150x150')"
              ></span>
              <div class="meta">
                <Tippy v-if="item.name.length > 100" placement="right">
                  <span class="dark-inverted filename">{{
                    truncateText(item.name, item.extension)
                  }}</span>
                  <template #content>
                    <div class="v-popover-content is-text">
                      <div class="popover-head">
                        <h4 class="dark-inverted">{{ item.name }}</h4>
                      </div>
                    </div>
                  </template>
                </Tippy>
                <span v-else class="dark-inverted filename">{{ item.name }}</span>
                <span>
                  <span>{{ item.size }}</span>
                  <i aria-hidden="true" class="fas fa-circle icon-separator"></i>
                  <span>Updated <timeago :datetime="item.updated" autoUpdate /></span>
                </span>
              </div>
              <FileTileDropdown
                :document="item"
                :show-menu="currentContextMenu === item.id"
                @opened="setCurrentContextMenu"
                @click="onSelectedFile(item.id)"
                @delete="handleOnDeleteDocument"
                @download="handleOnDownloadDocument"
                @edit="handleOnEditDocument"
                @view="handleOnPreviewDocument"
              />
            </div>
            <div class="tile-grid-item-footer mt-4" v-if="item.match.length > 0">
              <h3 class="is-narrow is-6 title mb-2">Match:</h3>
              <ul>
                <li v-for="(match, key) in item.match" :key="key">
                  <span class="subject">{{ getSubjectLabel(match.field) }}: </span>
                  <span class="description" v-html="match.value"></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../../../scss/abstracts/mixins';

.tile-grid {
  .columns {
    margin-left: -0.5rem !important;
    margin-right: -0.5rem !important;
    margin-top: -0.5rem !important;
  }

  .column {
    padding: 0.5rem !important;
  }
}

.tile-grid-v2 {
  .columns {
    .column {
      display: flex;
      align-items: center;

      .status {
        height: 8px;
        width: 8px;
        min-width: 8px;
        margin: 0 16px 0 0;

        &.has-user-metadata {
          border-radius: var(--radius-rounded);
          background: var(--warning);
        }
      }

      .tile-grid-item {
        @include vuero-s-card;

        border-radius: 14px;
        padding: 16px;
        cursor: pointer;

        &.is-active {
          border-color: var(--primary) !important;
          box-shadow: var(--primary-box-shadow) !important;
        }

        .tile-grid-item-inner {
          display: flex;
          align-items: center;

          > img {
            display: block;
            width: 50px;
            height: 50px;
            min-width: 50px;
          }

          .meta {
            margin-left: 10px;
            line-height: 1.4;

            .filename {
              word-break: break-all;
            }

            span {
              display: block;
              font-family: var(--font);

              &:first-child {
                color: var(--dark-text);
                font-family: var(--font-alt);
                font-weight: 600;
                font-size: 1rem;
              }

              &:nth-child(2) {
                display: flex;
                align-items: center;

                span {
                  display: inline-block;
                  color: var(--light-text);
                  font-size: 0.8rem;
                  font-weight: 400;
                }

                .icon-separator {
                  position: relative;
                  font-size: 4px;
                  color: var(--light-text);
                  padding: 0 6px;
                }
              }
            }
          }

          .dropdown {
            margin-left: auto;
          }

          .fiv-viv {
            min-width: 3rem;
          }
        }

        .tile-grid-item-footer {
          ul {
            list-style: disc;
            margin-left: 2rem;

            li {
              &:not(:last-child) {
                margin-bottom: 0.5rem;
              }

              .subject {
                font-weight: 500;
              }

              .description {
                em {
                  font-weight: 500;
                  background: var(--yellow);
                  padding: 3px;
                  border-radius: var(--radius);
                }
              }
            }
          }
        }
      }
    }
  }
}

.is-dark {
  .tile-grid {
    .tile-grid-item {
      @include vuero-card--dark;
    }
  }

  .tile-grid-v2 {
    .tile-grid-item {
      @include vuero-card--dark;

      &:hover {
        border-color: var(--primary) !important;
      }
    }
  }
}
</style>
