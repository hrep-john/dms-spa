<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import { handleVuexApiCall } from '/@src/utils/helper'
import { useUserSession } from '/@src/stores/userSession'
import UdfEnum from '../../../../enums/udf'

import { Field, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

const { t } = useI18n()
const userSession = useUserSession()

const props = defineProps({
  errors: {
    type: Array,
    default: {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  defaultValue: {
    type: Object,
    default: {},
  },
  isNew: {
    type: Boolean,
    default: false,
  },
})

// Define a validation schema
let objectSchema = {
  label: yup
    .string()
    .required(t('validation.label.required'))
    .max(255, t('validation.common.input_field_maximum_length')),
  entitable_type: yup
    .string()
    .nullable()
    .required(t('validation.udf.module.required'))
    .max(255, t('validation.common.input_field_maximum_length'))
    .oneOf([null, 'App\\Models\\Document'], t('validation.udf.module.in')),
  type: yup
    .string()
    .nullable()
    .required(t('validation.udf.type.required'))
    .max(255, t('validation.common.input_field_maximum_length'))
    .oneOf([null, '1', '2', '3', '4'], t('validation.udf.type.in')),
}

const schema = yup.object(objectSchema)

const notyf = useNotyf()
const emit = defineEmits(['submit'])
const udfTypeLists = ref(Array())
const udfModuleLists = ref(Array())
const udfSourceLists = ref(Array())
const selectedSourceLists = ref(Array())
const customList = ref('')
const selectedUdfType = ref(null)
const selectedDataSource = ref(null)
const udfVisibilityValue = ref(true)

const { y } = useWindowScroll()

const details = ref({})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: details,
})

const isStuck = computed(() => {
  return y.value > 30
})

const mappings = (data: any) => {
  let formatted = {
    entitable_type: data.entitable_type,
    tenant_id: JSON.parse(userSession.user).tenant_id,
    key: data.label.replace(/\s+/g, '_').toLowerCase(),
    section: UdfEnum.Section.List.value,
    visible: udfVisibilityValue.value,
    type: data.type,
    label: data.label,
    settings: '{}',
  }

  if (data.type == UdfEnum.Types.Dropdown.value) {
    let settings = {
      source: selectedDataSource.value,
      data: [],
    }

    if (settings.source == UdfEnum.DataSource.Custom.value) {
      settings.data = selectedSourceLists.value
    }

    formatted.settings = JSON.stringify(settings)
  }

  return formatted
}

const onAddSourceLists = () => {
  const isItemIncluded = selectedSourceLists.value.find(
    (item) => item.label === customList.value
  )

  if (customList.value === '') {
    return
  } else if (isItemIncluded) {
    notyf.error(`${customList.value} is already selected.`)
    return
  }

  selectedSourceLists.value.push({
    id: null,
    label: customList.value,
  })
  customList.value = ''
}

const onRemoveSelectedSourceLists = (index: any) => {
  selectedSourceLists.value.splice(index, 1)
}

const onSubmit = handleSubmit(async (values) => {
  const data = mappings(values)

  emit('submit', data)
})

const handleDefaultValue = () => {
  const defaultValue = props.defaultValue

  if (defaultValue) {
    udfVisibilityValue.value = defaultValue.visible
    selectedUdfType.value = defaultValue.type
    selectedDataSource.value = defaultValue.settings.source
    selectedSourceLists.value = defaultValue.settings.data

    details.value = defaultValue
  }
}

const isLoading = computed(() => {
  return props.loading
})

onMounted(() => {
  udfSourceLists.value = Object.values(UdfEnum.DataSource)
  udfTypeLists.value = Object.values(UdfEnum.Types)
  udfModuleLists.value = Object.values(UdfEnum.Modules)
})

watch(
  () => [props.defaultValue],
  (values) => {
    handleDefaultValue()
  }
)
</script>

<template>
  <form class="form-layout">
    <div class="form-outer">
      <div :class="[isStuck && 'is-stuck']" class="form-header stuck-header">
        <div class="form-header-inner">
          <div class="left">
            <h3>{{ props.title }}</h3>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                icon="lnir lnir-arrow-left rem-100"
                :to="{ name: 'settings-udfs' }"
                light
                dark-outlined
              >
                Cancel
              </VButton>
              <VButton
                color="primary"
                raised
                :loading="isLoading"
                tabindex="0"
                @keydown.space.prevent="onSubmit"
                @click="onSubmit"
              >
                Submit
              </VButton>
            </div>
          </div>
        </div>
      </div>
      <div class="form-body">
        <!--Fieldset-->
        <div class="form-fieldset" v-if="!props.isNew">
          <div class="fieldset-heading">
            <h4>{{ t('label.record_info') }}</h4>
          </div>

          <div class="columns is-multiline">
            <div class="column is-6">
              <VField>
                <label>{{ t('label.created_by') }}</label>
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
            <div class="column is-6">
              <VField>
                <label>{{ t('label.date_created') }}</label>
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
            <div class="column is-6">
              <VField>
                <label>{{ t('label.updated_by') }}</label>
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
            <div class="column is-6">
              <VField>
                <label>{{ t('label.last_updated') }}</label>
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
          </div>
        </div>

        <!--Fieldset-->
        <div class="form-fieldset">
          <div class="fieldset-heading">
            <h4>User Defined Field Info</h4>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="label">
                <VField>
                  <label>{{ t('label.label') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      autocomplete="name"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-4">
              <Field v-slot="{ field, errorMessage }" name="entitable_type">
                <VField>
                  <label>{{ t('label.module') }}</label>
                  <VControl :has-error="Boolean(errorMessage)">
                    <Multiselect
                      v-model="field.value"
                      v-bind="field"
                      :searchable="true"
                      :options="udfModuleLists"
                      :disabled="isLoading"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-2">
              <VField>
                <label>{{ t('label.show') }}</label>
                <VSwitchBlock color="primary" v-model="udfVisibilityValue" />
              </VField>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="type">
                <VField>
                  <label>{{ t('label.type') }}</label>
                  <VControl :has-error="Boolean(errorMessage)">
                    <Multiselect
                      v-model="field.value"
                      v-bind="field"
                      @change="selectedUdfType = $event"
                      :searchable="true"
                      :options="udfTypeLists"
                      :disabled="isLoading"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div
              class="column is-6"
              v-show="selectedUdfType == UdfEnum.Types.Dropdown.value"
            >
              <VField>
                <label>{{ t('label.data_source') }}</label>
                <VControl :has-error="Boolean(errorMessage)">
                  <Multiselect
                    v-model="selectedDataSource"
                    :searchable="true"
                    :options="udfSourceLists"
                    :disabled="isLoading"
                  />
                </VControl>
              </VField>
            </div>

            <!--Field-->
            <div
              class="column is-12"
              v-show="
                selectedUdfType == UdfEnum.Types.Dropdown.value &&
                selectedDataSource == UdfEnum.DataSource.Custom.value
              "
            >
              <VField>
                <label>{{ t('info.press_enter_key_to_add_an_item') }}</label>
                <VControl
                  :has-error="Boolean(errorMessage)"
                  class="wrapper-add-custom-list"
                >
                  <input
                    v-bind="field"
                    class="input"
                    type="text"
                    :disabled="isLoading"
                    autocomplete="name"
                    v-model="customList"
                    @keyup.enter.native="onAddSourceLists"
                  />

                  <VButton
                    class="add-button"
                    icon="lnir lnir-plus rem-100"
                    color="primary"
                    raised
                    :loading="isLoading"
                    tabindex="0"
                    @click="onAddSourceLists"
                  >
                    Add
                  </VButton>
                </VControl>
              </VField>
            </div>

            <!--Field-->
            <div
              class="column is-12"
              v-show="
                selectedUdfType == UdfEnum.Types.Dropdown.value &&
                selectedSourceLists.length > 0 &&
                selectedDataSource == UdfEnum.DataSource.Custom.value
              "
            >
              <VCard radius="small" elevated>
                <h4 class="fieldset-heading mb-2">Selected List</h4>
                <VField grouped multiline>
                  <VControl v-for="(item, key) in selectedSourceLists" :key="key">
                    <VTags addons>
                      <VTag :label="item.label" color="primary" />
                      <VTag remove :key="key" @click="onRemoveSelectedSourceLists(key)" />
                    </VTags>
                  </VControl>
                </VField>
              </VCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<style lang="scss">
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

      .wrapper-add-custom-list {
        display: flex;

        .add-button {
          margin-left: 0.5rem;
        }
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
