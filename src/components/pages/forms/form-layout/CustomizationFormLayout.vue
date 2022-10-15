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
const configItems = ref([])
const cloneConfigs = ref(null)
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
    console.error(error)
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
    console.error(error)
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
  return [
    {
      title: 'Application Theme',
      description: 'This will apply to all pages in the application.',
      items: [
        {
          type: 'color-picker',
          key: '--primary',
          data: getConfigItem('--primary'),
        },
        {
          type: 'color-picker',
          key: '--dark-text',
          data: getConfigItem('--dark-text'),
        },
        {
          type: 'color-picker',
          key: '--background-color',
          data: getConfigItem('--background-color'),
        },
      ],
    },
    {
      title: 'Sidebar Navigation',
      description: 'This will apply to the right sidebar navigation.',
      items: [
        {
          type: 'color-picker',
          key: '--main-sidebar-font-color',
          data: getConfigItem('--main-sidebar-font-color'),
        },
        {
          type: 'color-picker',
          key: '--main-sidebar-background-color',
          data: getConfigItem('--main-sidebar-background-color'),
        },
        {
          type: 'image-upload',
          key: 'tenant-logo',
          data: getConfigItem('tenant-logo'),
        },
      ],
    },
    {
      title: 'Login',
      description: 'This will apply to the login page.',
      items: [
        {
          type: 'color-picker',
          key: '--login-left-section-background-color',
          data: getConfigItem('--login-left-section-background-color'),
        },
        {
          type: 'color-picker',
          key: '--login-right-section-background-color',
          data: getConfigItem('--login-right-section-background-color'),
        },
        {
          type: 'image-upload',
          key: 'login-placeholder-image',
          data: getConfigItem('login-placeholder-image'),
        },
      ],
    },
    {
      title: 'Forgot Password',
      description: 'This will apply to the forgot password page.',
      items: [
        {
          type: 'color-picker',
          key: '--forgot-password-left-section-background-color',
          data: getConfigItem('--forgot-password-left-section-background-color'),
        },
        {
          type: 'color-picker',
          key: '--forgot-password-right-section-background-color',
          data: getConfigItem('--forgot-password-right-section-background-color'),
        },
        {
          type: 'image-upload',
          key: 'forgot-password-placeholder-image',
          data: getConfigItem('forgot-password-placeholder-image'),
        },
      ],
    },
    {
      title: 'Reset Password',
      description: 'This will apply to the reset password page.',
      items: [
        {
          type: 'color-picker',
          key: '--reset-password-left-section-background-color',
          data: getConfigItem('--reset-password-left-section-background-color'),
        },
        {
          type: 'color-picker',
          key: '--reset-password-right-section-background-color',
          data: getConfigItem('--reset-password-right-section-background-color'),
        },
        {
          type: 'image-upload',
          key: 'reset-password-placeholder-image',
          data: getConfigItem('reset-password-placeholder-image'),
        },
      ],
    },
  ]
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
            <h3>Customize User Interface</h3>
            <p>Edit your application user interface</p>
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
                :disabled="!doesUserCan('Settings: Edit Tenant Customization')"
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
        <div class="fieldset" v-for="(config, key) in configItems" :key="key">
          <div class="fieldset-heading">
            <h4>{{ config.title }}</h4>
            <p>{{ config.description }}</p>
          </div>

          <div class="columns is-multiline">
            <div
              v-for="(configItem, configItemsKey) in config.items"
              :key="configItemsKey"
              class="column is-6"
            >
              <ColorPicker
                v-if="configItem.type === 'color-picker'"
                :color="configItem.data.key"
                :label="configItem.data.label"
                :value="configItem.data.value"
                @change="onChangeEventHandler"
              />

              <FileUploadCard
                v-else-if="configItem.type === 'image-upload'"
                :data="configItem.data"
                @add="onAddFile"
                @remove="onRemoveFile"
                @selected="onSelectedEventHandler"
              />
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
}
</style>
