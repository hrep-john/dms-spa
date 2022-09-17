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

  if (response.success) {
    const url = response.data.url
    const index = getConfigItemIndex(selectedFileUpload.value)

    configs.value[index].value = url
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isLoading.value = false
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
    tenant_document_series_id_prefix: {
      type: 'text',
      disabled: false,
      value: getConfigItem('tenant.document.series.id.prefix'),
    },
    tenant_document_series_counter_length: {
      type: 'number',
      disabled: false,
      value: getConfigItem('tenant.document.series.counter.length'),
    },
    tenant_document_series_current_counter: {
      type: 'number',
      disabled: true,
      value: getConfigItem('tenant.document.series.current.counter'),
    },
  }
}

const resetCounterHandler = () => {
  const config = configItems.value['tenant_document_series_current_counter'].value

  config.value = 0
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
  <div>
    <VProgress size="tiny" v-show="isLoading" />
    <div class="account-box is-form is-footerless">
      <div class="form-head stuck-header" :class="[isScrolling && 'is-stuck']">
        <div class="form-head-inner">
          <div class="left">
            <h3>Customize Tenant Settings</h3>
            <p>Edit your preferred tenant settings</p>
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
            <p>This will apply to new documents.</p>
          </div>

          <div class="columns is-multiline">
            <div
              class="column is-3"
              v-for="(configItem, configItemKey) in configItems"
              :key="configItemKey"
            >
              <VField>
                <label>{{ configItem.value.label }}</label>
                <VControl icon="feather:file-text">
                  <input
                    :type="configItem.type"
                    class="input"
                    v-model="configItem.value.value"
                    :disabled="configItem.disabled"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-3 reset-wrapper">
              <VField>
                <VButton
                  color="danger"
                  icon="feather:refresh-cw"
                  @click="resetCounterHandler"
                  raised
                  rounded
                >
                  Reset Counter
                </VButton>
              </VField>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-body {
  .message {
    margin-bottom: 0.75rem;
  }

  .fieldset {
    max-width: unset !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }

  .reset-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
