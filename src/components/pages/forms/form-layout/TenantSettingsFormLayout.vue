<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

import { onceImageErrored } from '/@src/utils/via-placeholder'
import { useNotyf } from '/@src/composable/useNotyf'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTenantSettings } from '/@src/stores/tenantSettings'
import { handleVuexApiCall, doesUserCan } from '/@src/utils/helper'
import tenantSettingsService from '/@src/stores/tenantSettings'

const emit = defineEmits(['submit', 'uploadfile'])

const { t } = useI18n()
const router = useRouter()
const notyf = useNotyf()
const { y } = useWindowScroll()
const tenantSettings = useTenantSettings()
const service = tenantSettingsService.actions

const isLoading = ref(false)
const configs = ref([])
const cloneConfigs = ref(null)
const configItems = ref([])
const selectedFileUpload = ref('')

const isScrolling = computed(() => {
  return y.value > 30
})

const isStuck = computed(() => {
  return y.value > 30
})

const onAddFile = async (data: any) => {
  if (isLoading.value) {
    return
  }

  const { error, file } = data

  if (error) {
    notyf.error(error)
    return
  }

  isLoading.value = true

  const payload = new FormData()
  payload.append('image', file.file)

  const response = await handleVuexApiCall(
    service.handleUploadFileTenantSettings,
    payload
  )

  isLoading.value = false

  if (response.success) {
    const url = response.data.url
    const index = getConfigItemIndex(selectedFileUpload.value)

    configs.value[index].value = url
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const onRemoveFile = (data: any) => {
  const { error, file } = data

  if (error) {
    notyf.error(error)
    return
  }
}

const onSelectedEventHandler = (key: string) => {
  selectedFileUpload.value = key
}

const onChangeEventHandler = (data: object) => {
  const index = configs.value.findIndex((config) => config?.key === data?.key)

  configs.value[index].value = data.value
}

const onSubmit = () => {
  cloneConfigs.value = configs.value

  emit('submit', configs.value)
}

const getConfigItem = (key: string) => {
  return configs.value.find((config) => config?.key === key)
}

const getConfigItemIndex = (key: string) => {
  return configs.value.findIndex((config) => config?.key === key)
}

const getConfigItems = () => {
  return {
    tenant_document_series_id_prefix: getConfigItem('tenant.document.series.id.prefix')
      ?.value,
    tenant_document_series_counter_length: getConfigItem(
      'tenant.document.series.counter.length'
    )?.value,
    tenant_document_series_current_counter:
      getConfigItem('tenant.document.series.current.counter')?.value || '',
    tenant_default_document_user_access: getConfigItem(
      'tenant.default.document.user.access'
    )?.value,
  }
}

const nextDocumentSeries = computed(() => {
  const prefix = configItems.value['tenant_document_series_id_prefix']
  const precision = configItems.value['tenant_document_series_counter_length']
  const counter = `${configItems.value['tenant_document_series_current_counter']}` || ''
  const paddedCounter = counter.padStart(precision, '0')

  syncConfigItem('tenant.document.series.id.prefix', prefix)
  syncConfigItem('tenant.document.series.counter.length', precision)
  syncConfigItem('tenant.document.series.current.counter', counter)

  return `${prefix}${paddedCounter}`
})

const syncConfigItem = (key: any, value: any) => {
  let index = getConfigItemIndex(key)

  if (index > 0) {
    configs.value[index].value = value
  }
}

const resetCounterHandler = () => {
  configItems.value['tenant_document_series_current_counter'] = '1'
}

onMounted(() => {
  configs.value = tenantSettings.tenantSettings

  // DEEP CLONE
  cloneConfigs.value = JSON.parse(JSON.stringify(configs.value))

  configItems.value = getConfigItems()
})

onBeforeUnmount(() => {
  tenantSettings.setTenantSettings(cloneConfigs.value)
})
</script>

<template>
  <form class="form-layout account-box is-form">
    <VProgress size="tiny" v-show="isLoading" />
    <div class="form-outer">
      <div :class="[isStuck && 'is-stuck']" class="form-header stuck-header">
        <div class="form-header-inner">
          <div class="left">
            <h3>Edit Tenant Settings</h3>
            <p>Customize your system settings</p>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                :to="{ name: 'settings' }"
                icon="lnir lnir-arrow-left rem-100"
                light
                dark-outlined
              >
                Go Back
              </VButton>
              <VButton
                color="primary"
                raised
                :loading="isLoading"
                :disabled="!doesUserCan('Settings: Edit Tenant Settings')"
                tabindex="0"
                @keydown.space.prevent="onSubmit"
                @click="onSubmit"
              >
                Save Changes
              </VButton>
            </div>
          </div>
        </div>
      </div>
      <div class="form-body">
        <!--Fieldset-->
        <div class="fieldset">
          <div class="fieldset-heading">
            <h4>Document Series</h4>
            <p>This will automatically ingest newly uploaded documents.</p>
          </div>

          <div class="columns is-multiline">
            <div class="column is-12">
              <VField>
                <label>Document Series Prefix</label>
                <VControl icon="feather:file-text">
                  <input
                    type="text"
                    class="input"
                    v-model="configItems['tenant_document_series_id_prefix']"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-12">
              <VField>
                <label>Document Series Precision</label>
                <VControl icon="feather:file-text">
                  <input
                    type="number"
                    class="input"
                    v-model="configItems['tenant_document_series_counter_length']"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-9">
              <VField>
                <label>Next Document Series</label>
                <VControl icon="feather:file-text">
                  <input
                    type="text"
                    class="input"
                    v-model="nextDocumentSeries"
                    disabled
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-12">
              <VField>
                <label>Reset Document Series</label>
                <VControl>
                  <VButton
                    fullwidth
                    color="danger"
                    icon="feather:refresh-cw"
                    @click="resetCounterHandler"
                  >
                    Reset Series
                  </VButton>
                </VControl>
              </VField>
            </div>
          </div>
        </div>

        <!--Fieldset-->
        <div class="fieldset">
          <div class="fieldset-heading">
            <h4>Document User Access</h4>
            <p>
              This will be the default document user access to newly uploaded documents.
            </p>
          </div>
          <div class="columns is-multiline">
            <VField>
              <div class="column is-12">
                <label>Do you want to allow other users to access this document? </label>
              </div>
              <div class="is-12">
                <VRadio
                  v-model="configItems['tenant_default_document_user_access']"
                  :value="1"
                  @change="syncConfigItem('tenant.default.document.user.access', 1)"
                  label="Yes, allow all users to access this document."
                  name="outlined_squared_radio"
                  color="primary"
                  square
                />
              </div>
              <div class="is-12">
                <VRadio
                  v-model="configItems['tenant_default_document_user_access']"
                  :value="3"
                  @change="syncConfigItem('tenant.default.document.user.access', 3)"
                  label="No, don't allow."
                  name="outlined_squared_radio"
                  color="primary"
                  square
                />
              </div>
            </VField>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@import '../../../../scss/abstracts/mixins';

.is-navbar {
  .form-layout {
    margin-top: 30px;
  }
}

.form-layout {
  max-width: 740px;
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

      .fieldset {
        max-width: unset !important;
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
      }
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
        .fieldset {
          max-width: unset !important;
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
        }

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

      .form-body {
        padding: 0px !important;
      }
    }
  }
}
</style>
