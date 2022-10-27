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
  <div class="form-layout account-box is-form">
    <VProgress size="tiny" v-show="isLoading" />
    <div class="form-outer">
      <div :class="[isStuck && 'is-stuck']" class="form-header stuck-header">
        <div class="form-header-inner">
          <div class="left">
            <h3>Customize User Interface</h3>
            <p>Edit your system user interface</p>
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
