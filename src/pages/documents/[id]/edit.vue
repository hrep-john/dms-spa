<script setup lang="ts">
/**
 * This is a Vue Component that will be
 * automatically mapped to a entry on vue-router.
 *
 * You will be able to access this page at http://localhost:3000/starters/sidebar-blank-page-1
 * Page uri will match related path to src/pages folder
 *
 * Read more about routing:
 * @see /vite.config.ts
 * @see /src/router.ts
 */

import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { onMounted, ref, computed } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import { useRouter } from 'vue-router'
import ModuleEnum from '/@src/enums/module'
import documentServices from '/@src/stores/documents'
import udfServices from '/@src/stores/udfs'
import { handleVuexApiCall, createTempDownloadBtnLink } from '/@src/utils/helper'
import UdfEnum from '/@src/enums/udf'

const router = useRouter()
const notyf = useNotyf()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Edit Details')

useHead({
  title: `Edit Details - ${import.meta.env.VITE_PROJECT_NAME}`,
})

const routeParams = router.currentRoute.value.params
const documentService = documentServices.actions
const udfService = udfServices.actions
const isLoading = ref(false)
const udfs = ref([])
const udfDates = ref([])
const details = ref({
  user_defined_field: [],
})
const auditLogs = ref([])
const accessControl = ref({
  allow_all: true,
  selected_users: [],
})

const breadcrumb = [
  {
    label: 'Document List',
    icon: 'feather:file',
    to: {
      name: 'documents',
    },
  },
  {
    label: 'Edit Details',
  },
]

const submit = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    id: routeParams.id,
    user_defined_field: getUdfsValue(),
  }

  const response = await handleVuexApiCall(
    documentService.handleEditDocumentMetadata,
    payload
  )

  isLoading.value = false

  if (response.success) {
    details.value = response.data.result
    notyf.success(response.data.message)
    router.push({ name: 'documents' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const getUdfsValue = () => {
  // format all udfs with date format
  for (let i = 0; i < udfDates.value.length; i++) {
    const column = udfDates.value[i]
    if (
      details.value.user_defined_field[column] !== null &&
      details.value.user_defined_field[column] !== ''
    ) {
      details.value.user_defined_field[column] = new Date(
        details.value.user_defined_field[column]
      )
        .toISOString()
        .split('T')[0]
    }
  }

  return details.value.user_defined_field
}

const getUdfs = async (initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  isLoading.value = true

  const payload: any = {
    filters: [
      { column: 'entitable_type', operator: '=', join: 'OR', value: ModuleEnum.Document },
    ],
  }

  const response = await handleVuexApiCall(udfService.handleGetAllUdfs, payload)

  isLoading.value = false

  if (response.success) {
    formatUdfResults(response.data.results)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const formatUdfResults = (items: any) => {
  const formatted: any = []

  if (items.length > 0) {
    items.forEach((udf: any) => {
      let field = {}
      const column = udf.key

      if (udf.type === UdfEnum.Types.Text.value) {
        field = {
          column: column,
          name: udf.label,
          type: 'text',
        }
      } else if (udf.type === UdfEnum.Types.Number.value) {
        field = {
          column: column,
          name: udf.label,
          type: 'number',
        }
      } else if (udf.type === UdfEnum.Types.Dropdown.value) {
        field = {
          column: column,
          name: udf.label,
          type: 'dropdown',
          options: formatDropdownOptions(udf?.settings?.options),
        }
      } else if (udf.type === UdfEnum.Types.Date.value) {
        field = {
          column: column,
          name: udf.label,
          type: 'date',
        }

        udfDates.value.push(column)
      }

      formatted.push(field)
    })
  }

  udfs.value = formatted
}

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

const getDocumentMetadata = async (initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(
    documentService.handleShowDocumentMetadata,
    routeParams.id
  )

  isLoading.value = false

  if (response.success) {
    details.value = response.data.result
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'documents' })
  }
}

const getDocumentAuditLogs = async (initial = false) => {
  if (isLoading.value && !initial) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(
    documentService.handleGetDocumentAuditLogs,
    routeParams.id
  )

  isLoading.value = false

  if (response.success) {
    auditLogs.value = response.data.results
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push({ name: 'documents' })
  }
}

const handleOnDownloadDocument = async (id: any) => {
  isLoading.value = true
  const payload = { id: id }
  const response = await handleVuexApiCall(
    documentService.handleDownloadDocument,
    payload
  )

  if (response.success) {
    setTimeout(() => {
      createTempDownloadBtnLink(response.data.result)
      notyf.success(response.data.message)
      isLoading.value = false
    }, 500)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

onMounted(async () => {
  await getUdfs(true)
  await getDocumentMetadata(true)
  await getDocumentAuditLogs(true)
})
</script>

<template>
  <SidebarLayout>
    <!-- Content Wrapper -->
    <div class="page-content-inner">
      <!--
          Page content goes here

          You can see pages content samples from 
          files in /src/components/pages directory
        -->
      <VBreadcrumb :items="breadcrumb" separator="arrow" with-icons />

      <VProgress size="tiny" v-show="isLoading" />

      <form class="form-layout" @submit.prevent>
        <div class="form-outer">
          <div :class="[isStuck && 'is-stuck']" class="form-header stuck-header">
            <div class="form-header-inner">
              <div class="left">
                <h3>Document No: {{ details.id }}</h3>
              </div>
              <div class="right">
                <div class="buttons">
                  <Tippy placement="top">
                    <VIconButton
                      color="info"
                      light
                      raised
                      darkOutlined
                      icon="lnir lnir-download"
                      @click="handleOnDownloadDocument(routeParams.id)"
                    />
                    <template #content>
                      <div class="v-popover-content is-text">
                        <div class="popover-head">
                          <h6 class="dark-inverted">Download</h6>
                        </div>
                      </div>
                    </template>
                  </Tippy>
                  <VButton
                    class="ml-2"
                    icon="lnir lnir-arrow-left rem-100"
                    :to="{ name: 'documents' }"
                    light
                    dark-outlined
                  >
                    Cancel
                  </VButton>
                  <VButton color="primary" raised @click="submit"> Submit </VButton>
                </div>
              </div>
            </div>
          </div>
          <div class="form-body">
            <!-- { label: 'Manage Access', value: 'manage-access', icon: 'fas fa-users' }, -->
            <VTabs
              selected="details"
              :tabs="[
                { label: 'Details', value: 'details', icon: 'fas fa-info-circle' },
                { label: 'Activity', value: 'activity', icon: 'fas fa-history' },
              ]"
            >
              <template #tab="{ activeValue }">
                <div v-if="activeValue === 'details'">
                  <div class="form-fieldset">
                    <div class="columns is-multiline">
                      <div class="column is-4">
                        <VField>
                          <label>File Name</label>
                          <VControl>
                            <input
                              type="text"
                              class="input"
                              :value="details.filename"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4">
                        <VField>
                          <label>Created By</label>
                          <VControl icon="feather:user">
                            <input
                              type="text"
                              class="input"
                              :value="details.created_by"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4">
                        <VField>
                          <label>Date Created</label>
                          <VControl icon="feather:calendar">
                            <input
                              type="text"
                              class="input"
                              :value="details.created_at"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4">
                        <VField>
                          <label>File Type</label>
                          <VControl>
                            <input
                              type="text"
                              class="input"
                              :value="details.extension"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4">
                        <VField>
                          <label>Updated By</label>
                          <VControl icon="feather:user">
                            <input
                              type="text"
                              class="input"
                              :value="details.updated_by"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4">
                        <VField>
                          <label>Last Updated</label>
                          <VControl icon="feather:calendar">
                            <input
                              type="text"
                              class="input"
                              :value="details.updated_at"
                              :disabled="true"
                            />
                          </VControl>
                        </VField>
                      </div>
                      <div class="column is-4" v-for="(udf, key) in udfs" :key="key">
                        <!-- TEXT FIELD -->
                        <label>{{ udf.name }}</label>

                        <textarea
                          type="textarea"
                          name="textarea"
                          class="input is-height-auto"
                          v-if="udf.type == 'text'"
                          v-model="details.user_defined_field[udf.column]"
                          placeholder="Input text here.."
                          :disabled="isLoading"
                          rows="5"
                          cols="50"
                        />

                        <!-- NUMBER FIELD -->
                        <input
                          type="number"
                          class="input"
                          v-if="udf.type == 'number'"
                          v-model="details.user_defined_field[udf.column]"
                          placeholder="Input number here.."
                          :disabled="isLoading"
                        />

                        <!-- DROPDOWN FIELD -->
                        <!-- Known Issues: https://github.com/shentao/vue-multiselect/issues/263 -->
                        <!-- Unable to bind only the id in v-model -->
                        <!-- Temporay Fix: Format as Object -->
                        <Multiselect
                          v-if="udf.type == 'dropdown'"
                          v-model="details.user_defined_field[udf.column]"
                          :options="udf.options"
                          :disabled="isLoading"
                          :searchable="true"
                          placeholder="Select an option"
                        />

                        <!-- DATE FIELD -->
                        <VField>
                          <VDatePicker
                            v-if="udf.type == 'date'"
                            v-model="details.user_defined_field[udf.column]"
                            color="green"
                            trim-weeks
                          >
                            <template #default="{ inputValue, inputEvents }">
                              <VField>
                                <VControl icon="feather:calendar">
                                  <input
                                    class="input"
                                    type="text"
                                    placeholder="Select a date"
                                    :value="inputValue"
                                    v-on="inputEvents"
                                    :disabled="isLoading"
                                  />
                                </VControl>
                              </VField>
                            </template>
                          </VDatePicker>
                        </VField>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="activeValue === 'access-control'">
                  <VSwitchBlock
                    v-model="accessControl.allow_all"
                    checked
                    label="Allow All Users"
                    color="primary"
                  />
                  <VControl v-if="!accessControl.allow_all" class="mt-2">
                    <Multiselect
                      v-model="tagsValue"
                      :attrs="{ id }"
                      mode="tags"
                      :searchable="true"
                      :create-tag="true"
                      :options="tagsOptions"
                      placeholder="Add Users"
                    />
                  </VControl>
                </div>
                <div v-else-if="activeValue === 'activity'">
                  <DocumentHistoryTimeline :items="auditLogs" />
                </div>
              </template>
            </VTabs>
          </div>
        </div>
      </form>
    </div>
  </SidebarLayout>
</template>

<style lang="scss">
@import '../../../scss/abstracts/mixins';

.is-navbar {
  .form-layout {
    margin-top: 30px;
  }
}

.form-layout {
  max-width: 100%;
  margin: 0 auto;

  .form-outer {
    @include vuero-s-card;

    padding: 0;

    .form-header {
      padding: 12px 20px;
      border-bottom: 1px solid var(--fade-grey-dark-3);
      transition: all 0.3s; // transition-all test

      &.is-stuck {
        background: var(--white);
        padding-right: 80px;
        border-left: 1px solid var(--fade-grey-dark-3);
      }

      .form-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .left {
        h3 {
          font-family: var(--font-alt);
          font-size: 1.2rem;
          font-weight: 600;
          line-height: 1.3;
        }

        p {
          font-size: 0.95rem;
        }
      }
    }

    .form-body {
      padding: 20px 40px 40px;
    }
  }
}

.is-dark {
  .form-layout {
    .form-outer {
      @include vuero-card--dark;

      .form-header {
        border-color: var(--dark-sidebar-light-12);

        &.is-stuck {
          background: var(--dark-sidebar);
          border-color: var(--dark-sidebar-light-6);
        }

        .left {
          h3 {
            color: var(--dark-dark-text);
          }
        }
      }

      .form-body {
        .field {
          .control {
            .input,
            .textarea {
              &:focus {
                border-color: var(--primary);
              }
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .form-layout {
    .form-outer {
      .form-header {
        .form-header-inner {
          flex-direction: column;

          .left {
            text-align: center;
            margin-bottom: 12px;
          }

          .right {
            width: 100%;

            .buttons {
              display: flex;
              justify-content: space-between;
              margin: 0;

              .button {
                margin: 0;
                width: 49%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
